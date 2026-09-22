import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './create-notification.dto';

@Controller()
export class NotificationController {
    constructor(private readonly service: NotificationService) {}

    /** Called by other services to dispatch a notification (stubbed: persists + logs, no real push yet). */
    @Post()
    dispatch(@Body() dto: CreateNotificationDto) {
        return this.service.dispatch(dto);
    }

    /** GET /notifications/{userId} — matches the mobile app's NotificationsApiService contract. */
    @Get(':userId')
    findAllForUser(@Param('userId') userId: string) {
        return this.service.findAllForUser(userId);
    }

    /** PATCH /notifications/{notificationId}/read */
    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.service.markAsRead(id);
    }
}
