import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

/**
 * Thin wrapper around the Firebase Admin SDK. Stays "unconfigured" (every send
 * a harmless no-op) until FIREBASE_SERVICE_ACCOUNT_JSON is set, so the service
 * boots and keeps working exactly as before — persist + log only — until
 * someone provides real Firebase credentials.
 */
@Injectable()
export class FcmService implements OnModuleInit {
    private readonly logger = new Logger(FcmService.name);
    private app: admin.app.App | null = null;

    onModuleInit(): void {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!raw) {
            this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications are stubbed (logged only).');
            return;
        }

        try {
            const serviceAccount = JSON.parse(raw);
            this.app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            this.logger.log('Firebase Admin SDK initialized — pushes will be sent for real.');
        } catch (err) {
            this.logger.error(
                `Failed to initialize Firebase Admin SDK, falling back to stub: ${(err as Error).message}`,
            );
        }
    }

    get isConfigured(): boolean {
        return this.app !== null;
    }

    /**
     * Sends a push to one device. Returns 'sent', 'stubbed' (no Firebase config),
     * or 'invalid-token' (the caller should stop using this token — it's been
     * uninstalled or the app data was cleared).
     */
    async send(fcmToken: string, title: string, body: string): Promise<'sent' | 'stubbed' | 'invalid-token'> {
        if (!this.app) {
            return 'stubbed';
        }

        try {
            await admin.messaging(this.app).send({
                token: fcmToken,
                notification: { title, body },
            });
            return 'sent';
        } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
                return 'invalid-token';
            }
            this.logger.error(`FCM send failed: ${(err as Error).message}`);
            return 'stubbed';
        }
    }
}
