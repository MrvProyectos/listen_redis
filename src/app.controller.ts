import { Controller, HttpCode, HttpStatus } from '@nestjs/common';
import { Message } from '@google-cloud/pubsub';
import { EventPattern } from '@nestjs/microservices';
import { ValidationDTO } from './dto/validation.dto';
import { validate } from 'class-validator';
import { RedisService } from './service/redis/redis.service';
import { LoggerService } from './logger/logger.service';

require('dotenv').config();

@Controller()
export class AppController {
  constructor(
    private _redisService: RedisService,
    private _loggerService: LoggerService
  ){}

  @EventPattern(process.env.GCLOUD_SUBSCRIPTION_NAME)
  @HttpCode(HttpStatus.OK)
  async messageHandler(message: Message) {

      const dataSub = message.data ? message.data.toString() : null;
      const validationResult: ValidationDTO = JSON.parse(dataSub);

      await this._redisService.saveData(validationResult.id.toString(), JSON.stringify(validationResult));
      message.ack();
      this._loggerService.customInfo({}, {message: "Message Consumed"});
  };
}