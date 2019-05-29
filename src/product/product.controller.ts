import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { AuthGuard } from '@nestjs/passport';
import { SellerGuard } from '../guards/seller.guard';
import { User } from '../utilities/user.decorator';
import { User as UserDocument } from '../types/user';
import { Product } from '../types/product';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  listAll(): Promise<Product[]> {
    return this.productService.findall();
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  listMine(@User() user: UserDocument): Promise<Product[]> {
    const { id } = user;
    return this.productService.findByOwner(id);
  }

  @Get('/seller/:id')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  listBySeller(@Param('id') id: string): Promise<Product> {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  create(
    @Body() product: CreateProductDTO,
    @User() user: UserDocument,
  ): Promise<Product> {
    return this.productService.create(product, user);
  }

  @Get(':id')
  read(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  update(
    @Param('id') id: string,
    @Body() product: UpdateProductDTO,
    @User() user: UserDocument,
  ): Promise<Product> {
    const { id: userId } = user;
    return this.productService.update(id, product, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), SellerGuard)
  delete(
    @Param('id') id: string,
    @User() user: UserDocument,
  ): Promise<Product> {
    const { id: userId } = user;
    return this.productService.delete(id, userId);
  }
}
