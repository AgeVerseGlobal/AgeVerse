# AgeVerseGlobal Event & Retirement Reminder — Production Setup

The Event Calculator and Retirement Calculator reminders use Web Push + a Vercel server function + persistent Redis storage. This is the path that allows the notification to arrive even when the AgeVerseGlobal page/browser tab is closed, provided the browser/device still allows background push notifications.

## 1. Create the VAPID keys

Run:

```bash
node scripts/generate-vapid-keys.mjs
```

Keep `VAPID_PRIVATE_KEY` secret. Do not commit it to GitHub.

## 2. Create an Upstash Redis database

Create a Redis database and copy its REST URL and REST token.

Set these Vercel Environment Variables for Production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` = `mailto:contact@ageverse.global`
- `CRON_SECRET` = a long random secret

## 3. Deploy

The repository already contains:

- `/api/event-reminders/config.js`
- `/api/event-reminders/schedule.js`
- `/api/event-reminders/cancel.js`
- `/api/event-reminders/dispatch.js`
- `/api/event-reminders/_common.js`
- Retirement Calculator uses the same persistent scheduling API with `reminderKind: "retirement"` and supports retirement dates up to 101 years ahead.
- the Push-enabled service worker
- the client subscription/scheduling utility
- a Vercel Cron entry for `/api/event-reminders/dispatch`

## 4. Important Vercel plan requirement

The cron is configured for minute-level dispatch (`* * * * *`) so reminders can be delivered close to the selected reminder time. Vercel's current plan limits mean minute-level Cron precision requires a Pro or Enterprise plan; Hobby has hourly precision.

## 5. User permission

Notification permission is requested when the user submits an Event Calculator or Retirement Calculator reminder. The user must choose **Allow**. If permission is blocked, the calculator does not silently pretend the reminder is active; it reports the notification problem.

## 6. What happens after scheduling

1. The browser registers the AgeVerseGlobal service worker.
2. The browser creates a PushSubscription.
3. The reminder is stored persistently in Redis with its exact timestamp.
4. Vercel Cron calls the dispatcher.
5. The dispatcher sends an encrypted Web Push message.
6. The service worker displays the notification even when the page/tab is not open.
7. Clicking the notification opens the corresponding calculator (Event or Retirement).

A reminder whose scheduled time has already passed is not created, preventing false-success reminders.
