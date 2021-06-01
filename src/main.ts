import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { subServer } from './service/transport/subServer';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';

require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  app.connectMicroservice({
    strategy: new subServer(),
  });

  app.useGlobalFilters(new AllExceptionsFilter);
  
  await app.startAllMicroservicesAsync();
  const port = process.env.PORT;
  await app.listen(port);

  logger.log(`Server Start => ${port}`);
}
bootstrap();
