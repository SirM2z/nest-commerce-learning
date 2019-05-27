import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

if (process.env.NODE_ENV === 'test') {
  process.env.MONGO_URI = process.env.MONGO_URI_TEST;
  Logger.log(`Process in test`, 'Bootstrap');
}

const port = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
