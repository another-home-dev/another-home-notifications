import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * One row per student, holding the FCM token their phone last registered.
 * A fresh login (or a token refresh) overwrites the previous row for that user —
 * only the most recent install/device receives pushes.
 */
@Entity('device_tokens')
export class DeviceTokenOrmEntity {
    @PrimaryColumn()
    userId: string;

    @Column({ type: 'varchar', length: 512 })
    fcmToken: string;

    @UpdateDateColumn()
    updatedAt: Date;
}
