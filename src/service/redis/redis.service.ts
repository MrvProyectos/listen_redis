import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { ValidationDTO } from 'src/dto/validation.dto';
import { LoggerService } from 'src/logger/logger.service';

const asyncRedis = require("async-redis");
const createClient = asyncRedis.createClient();

createClient.on("error", function (err) {
    console.log("Error " + err);
});

@Injectable()
export class RedisService {
    constructor(private readonly _loggerService: LoggerService){}
    async saveData(key: string, dataDTO: any){

        // DTO
        const validationResult: ValidationDTO = dataDTO;
        const result = new ValidationDTO(validationResult);
        const validation = await validate(result);
        
        if (validation.length > 0){
            // SAVE DATA REDIS
            const dataString: any = await createClient.set(key, dataDTO);
            if (dataString !== null){
                this._loggerService.customInfo({}, {message: "Message Save Redis"});
                return JSON.stringify(dataString);
            }else{
                this._loggerService.customError({}, {message: "Internal Server Error - Service saveData"});
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    statusMessage: 'INTERNAL SERVER ERROR'
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            this._loggerService.customError({}, {message: "Internal Server Error - Service validateDTO"});
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                statusMessage: 'INTERNAL SERVER ERROR'
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}