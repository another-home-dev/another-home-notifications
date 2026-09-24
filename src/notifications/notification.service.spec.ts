import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let mockNotificationRepo: any;
    let mockDeviceTokenRepo: any;
    let mockFcm: jest.Mocked<FcmService>;

    beforeEach(() => {
        mockNotificationRepo = {
            create: jest.fn((dto) => dto),
            save: jest.fn(async (n) => ({ id: 'notif-1', ...n, createdAt: new Date() })),
            find: jest.fn(),
            update: jest.fn(),
        };
        mockDeviceTokenRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        mockFcm = { send: jest.fn(), isConfigured: false } as unknown as jest.Mocked<FcmService>;

        service = new NotificationService(mockNotificationRepo, mockDeviceTokenRepo, mockFcm);
    });

    it('always persists the notification, even with no device registered', async () => {
        mockDeviceTokenRepo.findOne.mockResolvedValue(null);

        const saved = await service.dispatch({ userId: 'stu-1', title: 'Hi', message: 'Body' });

        expect(saved.userId).toBe('stu-1');
        expect(mockFcm.send).not.toHaveBeenCalled();
    });

    it('sends a push when a device token is on file', async () => {
        mockDeviceTokenRepo.findOne.mockResolvedValue({ userId: 'stu-1', fcmToken: 'tok-abc' });
        mockFcm.send.mockResolvedValue('sent');

        await service.dispatch({ userId: 'stu-1', title: 'Hi', message: 'Body' });

        expect(mockFcm.send).toHaveBeenCalledWith('tok-abc', 'Hi', 'Body');
        expect(mockDeviceTokenRepo.delete).not.toHaveBeenCalled();
    });

    it('removes the device token once FCM reports it as invalid', async () => {
        mockDeviceTokenRepo.findOne.mockResolvedValue({ userId: 'stu-1', fcmToken: 'stale-tok' });
        mockFcm.send.mockResolvedValue('invalid-token');

        await service.dispatch({ userId: 'stu-1', title: 'Hi', message: 'Body' });

        expect(mockDeviceTokenRepo.delete).toHaveBeenCalledWith({ userId: 'stu-1' });
    });

    it('registers a device token by upserting on userId', async () => {
        await service.registerDeviceToken({ userId: 'stu-1', fcmToken: 'tok-new' });

        expect(mockDeviceTokenRepo.save).toHaveBeenCalledWith({ userId: 'stu-1', fcmToken: 'tok-new' });
    });
});
