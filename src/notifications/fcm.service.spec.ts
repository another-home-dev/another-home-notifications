import { FcmService } from './fcm.service';

describe('FcmService', () => {
    const originalEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    afterEach(() => {
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalEnv;
    });

    it('stays unconfigured and stubs sends when no credentials are set', async () => {
        delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const service = new FcmService();
        service.onModuleInit();

        expect(service.isConfigured).toBe(false);
        await expect(service.send('tok', 'Title', 'Body')).resolves.toBe('stubbed');
    });

    it('stays unconfigured when the credentials JSON is invalid, without throwing', () => {
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON = 'not-json';
        const service = new FcmService();

        expect(() => service.onModuleInit()).not.toThrow();
        expect(service.isConfigured).toBe(false);
    });
});
