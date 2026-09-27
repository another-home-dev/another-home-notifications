import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { DeviceTokenOrmEntity } from './device-token.orm-entity';
import { CreateNotificationDto } from './create-notification.dto';
import { RegisterDeviceTokenDto } from './register-device-token.dto';
import { FcmService } from './fcm.service';

/**
 * Persists every notification (so the app's in-app Alerts list always has a
 * history to show) and, when a device token is on file and Firebase is
 * configured, also pushes it — a real OS-level notification even if the app
 * is closed. Without Firebase configured, dispatch() still works exactly as
 * before: persisted + logged, no push.
 */
@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectRepository(NotificationOrmEntity)
        private readonly repo: Repository<NotificationOrmEntity>,
        @InjectRepository(DeviceTokenOrmEntity)
        private readonly deviceTokenRepo: Repository<DeviceTokenOrmEntity>,
        private readonly fcm: FcmService,
    ) {}

    async dispatch(dto: CreateNotificationDto): Promise<NotificationOrmEntity> {
        const notification = this.repo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            isRead: false,
        });
        const saved = await this.repo.save(notification);

        const device = await this.deviceTokenRepo.findOne({ where: { userId: dto.userId } });
        if (!device) {
            this.logger.log(`[NO DEVICE] user ${dto.userId} has no registered device — in-app only: "${dto.title}"`);
            return saved;
        }

        const result = await this.fcm.send(device.fcmToken, dto.title, dto.message);
        if (result === 'stubbed') {
            this.logger.log(`[STUB PUSH] would send FCM notification to user ${dto.userId}: "${dto.title}"`);
        } else if (result === 'invalid-token') {
            this.logger.warn(`Device token for user ${dto.userId} is no longer valid — removing it.`);
            await this.deviceTokenRepo.delete({ userId: dto.userId });
        }

        return saved;
    }

    /** Called by the mobile app right after login (and on token refresh). */
    async registerDeviceToken(dto: RegisterDeviceTokenDto): Promise<void> {
        await this.deviceTokenRepo.save({ userId: dto.userId, fcmToken: dto.fcmToken });
    }

    findAllForUser(userId: string): Promise<NotificationOrmEntity[]> {
        return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }

    async markAsRead(id: string): Promise<void> {
        const result = await this.repo.update({ id }, { isRead: true });
        if (result.affected === 0) {
            throw new NotFoundException(`Notification ${id} not found`);
        }
    }
}
