import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './create-notification.dto';
import { RegisterDeviceTokenDto } from './register-device-token.dto';

@Controller()
export class NotificationController {
    constructor(private readonly service: NotificationService) {}

    /** Called by other services to dispatch a notification (persists always; pushes too if the user has a registered device and Firebase is configured). */
    @Post()
    dispatch(@Body() dto: CreateNotificationDto) {
        return this.service.dispatch(dto);
    }

    /** POST /notifications/device-token — the mobile app calls this after login and on FCM token refresh. */
    @Post('device-token')
    registerDeviceToken(@Body() dto: RegisterDeviceTokenDto) {
        return this.service.registerDeviceToken(dto);
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
