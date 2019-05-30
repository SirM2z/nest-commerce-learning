import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'test'
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI,
      { useNewUrlParser: true },
    ),
    MulterModule.register({
      dest: process.env.UPLOAD_PATH,
    }),
    SharedModule,
    AuthModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
