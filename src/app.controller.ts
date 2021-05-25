import { Controller, HttpStatus, Res } from '@nestjs/common';
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
  async messageHandler(message: Message) {

    try{
      const dataSub = message.data ? message.data.toString() : null;
      const validationResult: ValidationDTO = JSON.parse(dataSub);
      const result = new ValidationDTO(validationResult);
      const validation = await validate(result);

      if (validation.length === 0){      
        await this._redisService.postData(validationResult.id.toString(), JSON.stringify(validationResult));
        this._loggerService.customInfo({}, {message: "Message Consumed"});
        message.ack();
      } else {
        this._loggerService.customError({}, {message: "Error consuming message"});
      }
    }catch(error) {
      return (HttpStatus.INTERNAL_SERVER_ERROR);
    }      
  }
}