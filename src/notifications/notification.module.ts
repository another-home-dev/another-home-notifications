import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationOrmEntity])],
    controllers: [NotificationController],
    providers: [NotificationService],
})
export class NotificationModule {}
