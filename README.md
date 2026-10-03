# Another Home — Notification Service

Stores every alert sent to a student and serves them to the mobile app's Alerts tab. When Firebase is configured, it also pushes each alert to the student's phone.

Part of [Another Home](https://github.com/another-home-dev). Reached through the API gateway at `/api/v1/notifications`.

## What it does

1. Another service (Finance or Operations) sends `{ userId, title, message }`.
2. The alert is saved, unread, so it always shows in the app's Alerts tab.
3. If the student has registered a device and Firebase credentials are set, the alert is also sent through Firebase Cloud Messaging as a phone notification. A token Firebase reports as invalid is deleted.

Without `FIREBASE_SERVICE_ACCOUNT_JSON`, step 3 is skipped and logged, and everything else works the same.

| Alert | Sent by | When |
| --- | --- | --- |
| Payment received | Finance | A payment is recorded |
| Payment due soon / Payment overdue | Finance | Daily 9 AM reminder job |
| Maintenance request resolved | Operations | A warden resolves a request |
| Visitor request approved / rejected | Operations | A warden decides a request |

## API

Paths are relative to `/api/v1/notifications`.

| Method | Path | Called by | Purpose |
| --- | --- | --- | --- |
| POST | `/` | Other services | Create an alert (and push it) |
| POST | `/device-token` | Mobile app | Register the phone's FCM token: `{ userId, fcmToken }` |
| GET | `/:userId` | Mobile app | A student's alerts, newest first |
| PATCH | `/:id/read` | Mobile app | Mark an alert as read |
| GET | `/health` | Kubernetes, Consul | Health check |

Each student has one device token; registering a new one replaces the old one.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Port to listen on | `4004` |
| `DB_HOST`, `DB_PORT` | MySQL server | `localhost`, `3306` |
| `DB_USERNAME`, `DB_PASSWORD` | MySQL credentials | |
| `DB_DATABASE` | Database name | `notification_service` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service-account key, as JSON text. Optional: without it, pushes are skipped | |
| `CONSUL_HOST`, `CONSUL_PORT` | Service registry to register with | |
| `SERVICE_ADDRESS` | Address this service registers under in Consul | |

## Run locally

The easiest way is to start the whole system with `docker compose up --build` from [another-home-infra](https://github.com/another-home-dev/anotherhome-infrastructure). Its README shows how to clone every repository into the folder names it expects.

To run this service on its own, with a MySQL server available:

```bash
npm install
npm run start:dev
```

## Tests

```bash
npm test   # unit tests for the notification and Firebase services
```

## Project structure

```
src/
├── main.ts
├── health.controller.ts
└── notifications/
    ├── notification.controller.ts
    ├── notification.service.ts     save, look up device, push
    ├── fcm.service.ts              Firebase Admin SDK wrapper
    ├── notification.orm-entity.ts  notifications table
    └── device-token.orm-entity.ts  device_tokens table
```

## Deployment

`cloudbuild.yaml` runs on every push to `main`: tests, Docker build, push to Artifact Registry, then a rolling update of the `notification` deployment on GKE.
