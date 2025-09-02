import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { User } from '../domain/entities/user/user.entity';
import { Notification } from '../domain/entities/notification/notification.entity';
import { Dashboard } from '../domain/entities/dashboard/dashboard.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.getTypeOrmConfig(),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Notification, Dashboard]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
