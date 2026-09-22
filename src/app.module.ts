import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notifications/notification.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 3306),
            username: process.env.DB_USERNAME ?? 'root',
            password: process.env.DB_PASSWORD ?? '',
            database: process.env.DB_DATABASE ?? 'notification_service',
            autoLoadEntities: true,
            synchronize: true, // Dev-only — replace with real migrations later.
        }),
        NotificationModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
