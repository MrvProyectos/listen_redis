import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './config/config.module';
import { RedisService } from './service/redis/redis.service';
import { LoggerService } from './logger/logger.service';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [RedisService, LoggerService],
})
export class AppModule {}
