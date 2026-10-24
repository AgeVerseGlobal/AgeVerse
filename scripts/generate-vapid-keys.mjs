import crypto from "node:crypto";

const ecdh = crypto.createECDH("prime256v1");
ecdh.generateKeys();
const privateKey = ecdh.getPrivateKey().toString("base64url");
const publicKey = ecdh.getPublicKey(undefined, "uncompressed").toString("base64url");

console.log("VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PRIVATE_KEY=" + privateKey);
console.log("VAPID_SUBJECT=mailto:contact@ageverse.global");
