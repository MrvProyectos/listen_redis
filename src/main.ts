import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { subServer } from './service/transport/subServer';

require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    strategy: new subServer(),
  });

  await app.startAllMicroservicesAsync();
  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
