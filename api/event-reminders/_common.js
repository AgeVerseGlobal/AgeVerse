import crypto from "node:crypto";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contact@ageverse.global";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const REMINDER_ZSET = "ageverse:event:reminders";
const REMINDER_PREFIX = "ageverse:event:reminder:";

function b64urlEncode(value) {
  return Buffer.from(value).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized + "=".repeat((4 - (normalized.length % 4)) % 4), "base64");
}

function requireServerConfig() {
  if (!REDIS_URL || !REDIS_TOKEN || !VAPID_PRIVATE_KEY) {
    const error = new Error("Event reminder server configuration is incomplete.");
    error.code = "CONFIG_MISSING";
    throw error;
  }
}

export async function redisCommand(command) {
  requireServerConfig();
  const response = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `Redis request failed with ${response.status}`);
  }
  return data.result;
}

export function jsonResponse(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export function assertPost(req) {
  if (req.method !== "POST") {
    const error = new Error("Method Not Allowed");
    error.statusCode = 405;
    throw error;
  }
}

export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function getVapidKeyPair() {
  requireServerConfig();
  const privateRaw = b64urlDecode(VAPID_PRIVATE_KEY);
  if (privateRaw.length !== 32) {
    const error = new Error("VAPID_PRIVATE_KEY must be a base64url encoded 32-byte P-256 private key.");
    error.code = "VAPID_INVALID";
    throw error;
  }

  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(privateRaw);
  return {
    privateRaw,
    publicRaw: ecdh.getPublicKey(undefined, "uncompressed"),
  };
}

export function getVapidPublicKey() {
  return b64urlEncode(getVapidKeyPair().publicRaw);
}

function derToJose(signature) {
  let offset = 2;
  if (signature[1] & 0x80) offset += (signature[1] & 0x7f);
  if (signature[offset] !== 0x02) throw new Error("Invalid ECDSA signature.");
  const rLength = signature[offset + 1];
  const rStart = offset + 2;
  const r = signature.subarray(rStart, rStart + rLength);
  offset = rStart + rLength;
  if (signature[offset] !== 0x02) throw new Error("Invalid ECDSA signature.");
  const sLength = signature[offset + 1];
  const sStart = offset + 2;
  const s = signature.subarray(sStart, sStart + sLength);

  const normalize = (value) => {
    let out = Buffer.from(value);
    while (out.length > 32 && out[0] === 0) out = out.subarray(1);
    if (out.length < 32) out = Buffer.concat([Buffer.alloc(32 - out.length), out]);
    return out;
  };

  return Buffer.concat([normalize(r), normalize(s)]);
}

function signVapidJwt(audience) {
  const { privateRaw, publicRaw } = getVapidKeyPair();
  const privateJwk = {
    kty: "EC",
    crv: "P-256",
    d: b64urlEncode(privateRaw),
    x: b64urlEncode(publicRaw.subarray(1, 33)),
    y: b64urlEncode(publicRaw.subarray(33, 65)),
    ext: true,
  };
  const key = crypto.createPrivateKey({ key: privateJwk, format: "jwk" });
  const header = b64urlEncode(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = b64urlEncode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  }));
  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign("SHA256");
  signer.update(signingInput);
  signer.end();
  const der = signer.sign(key);
  return `${signingInput}.${b64urlEncode(derToJose(der))}`;
}

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function hkdfExpand(prk, info, length) {
  const blocks = [];
  let previous = Buffer.alloc(0);
  let counter = 1;
  while (Buffer.concat(blocks).length < length) {
    previous = hmac(prk, Buffer.concat([previous, info, Buffer.from([counter])]));
    blocks.push(previous);
    counter += 1;
  }
  return Buffer.concat(blocks).subarray(0, length);
}

function encryptWebPushPayload(subscription, plaintext) {
  const clientPublic = b64urlDecode(subscription.keys?.p256dh);
  const auth = b64urlDecode(subscription.keys?.auth);
  if (clientPublic.length !== 65 || auth.length < 16) {
    throw new Error("Invalid PushSubscription keys.");
  }



  const ephemeral = crypto.createECDH("prime256v1");
  ephemeral.generateKeys();
  const ephemeralPublic = ephemeral.getPublicKey(undefined, "uncompressed");
  const sharedSecret = ephemeral.computeSecret(clientPublic);

  const keyInfo = Buffer.concat([
    Buffer.from("WebPush: info\0", "utf8"),
    clientPublic,
    ephemeralPublic,
  ]);
  const prkKey = hmac(auth, sharedSecret);
  const ikm = hkdfExpand(prkKey, keyInfo, 32);
  const salt = crypto.randomBytes(16);
  const prk = hmac(salt, ikm);
  const cek = hkdfExpand(prk, Buffer.from("Content-Encoding: aes128gcm\0", "utf8"), 16);
  const nonce = hkdfExpand(prk, Buffer.from("Content-Encoding: nonce\0", "utf8"), 12);

  const padded = Buffer.concat([Buffer.from(plaintext, "utf8"), Buffer.from([0x02])]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ciphertext = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()]);

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);
  return Buffer.concat([
    salt,
    recordSize,
    Buffer.from([ephemeralPublic.length]),
    ephemeralPublic,
    ciphertext,
  ]);
}

export async function sendWebPush(subscription, payload) {
  const endpoint = new URL(subscription.endpoint);
  const audience = `${endpoint.protocol}//${endpoint.host}`;
  const jwt = signVapidJwt(audience);
  const body = encryptWebPushPayload(subscription, JSON.stringify(payload));

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${getVapidPublicKey()}`,
      TTL: "86400",
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Urgency: "high",
    },
    body,
  });

  return response;
}

export function reminderKey(id) {
  return `${REMINDER_PREFIX}${id}`;
}

export { REMINDER_ZSET };
