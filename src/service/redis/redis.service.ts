import { Injectable } from '@nestjs/common';

const asyncRedis = require("async-redis");
const createClient = asyncRedis.createClient();

createClient.on("error", function (err) {
    console.log("Error " + err);
});

@Injectable()
export class RedisService {
    async postData(key: string, value: string){

        const dataString: string = await createClient.set(key, value);
        return (dataString);
    }
}
