import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { CreateNotificationDto } from './create-notification.dto';

/**
 * Stub notification dispatcher: persists the notification and logs it instead of
 * calling Firebase Cloud Messaging. Swap `dispatch()`'s logging line for a real
 * firebase-admin `send()` call once a Firebase project/service account is available —
 * the REST contract (create/list/mark-as-read) stays the same either way.
 */
@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectRepository(NotificationOrmEntity)
        private readonly repo: Repository<NotificationOrmEntity>,
    ) {}

    async dispatch(dto: CreateNotificationDto): Promise<NotificationOrmEntity> {
        const notification = this.repo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            isRead: false,
        });
        const saved = await this.repo.save(notification);
        this.logger.log(`[STUB PUSH] would send FCM notification to user ${dto.userId}: "${dto.title}"`);
        return saved;
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
