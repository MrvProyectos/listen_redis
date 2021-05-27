import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

const asyncRedis = require("async-redis");
const createClient = asyncRedis.createClient();

createClient.on("error", function (err) {
    console.log("Error " + err);
});

@Injectable()
export class RedisService {

    constructor(private readonly _loggerService: LoggerService){}
    async saveData(key: string, value: any){

        const dataString: string = await createClient.set(key, value);

        if (key && createClient){
            this._loggerService.customInfo({}, {message: "Message Save Redis"});
            return JSON.stringify(dataString);
        }else{
            this._loggerService.customError({}, {message: "Internal Server Error - Service"});
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                statusMessage: 'INTERNAL SERVER ERROR'
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}