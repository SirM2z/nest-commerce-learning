import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  uploadedFile(@UploadedFile() file, @Body('text') name: string) {
    return {
      imgUrl: `http://localhost:${process.env.PORT}/api/file/${file.filename}`,
    };
  }

  @Get('file/:filepath')
  returnFile(@Param('filepath') file, @Res() res) {
    return res.sendFile(file, { root: process.env.UPLOAD_PATH });
  }
}
