import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { DeviceTokenOrmEntity } from './device-token.orm-entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationOrmEntity, DeviceTokenOrmEntity])],
    controllers: [NotificationController],
    providers: [NotificationService, FcmService],
})
export class NotificationModule {}
