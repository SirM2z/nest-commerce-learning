import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../types/product';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private productModule: Model<Product>) {}

  async findall(): Promise<Product[]> {
    return await this.productModule.find().populate('owner');
  }

  async findByOwner(userId: string): Promise<Product[]> {
    return await this.productModule.find({ owner: userId }).populate('owner');
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModule.findById(id).populate('owner');
    if (!product) {
      throw new HttpException('Product dose not exist', HttpStatus.NO_CONTENT);
    }
    return product;
  }

  async create(productDTO: CreateProductDTO, userId: string): Promise<Product> {
    const { _id } = await this.productModule.create({
      ...productDTO,
      owner: userId,
      created: Date.now(),
    });
    return await this.productModule.findById(_id).populate('owner');
  }

  async update(
    id: string,
    productDTO: UpdateProductDTO,
    userId: string,
  ): Promise<Product> {
    const product = await this.productModule.findById(id);
    if (userId !== product.owner.toString()) {
      throw new HttpException(
        'You do not own this product',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await product.updateOne(productDTO);
    return await this.productModule.findById(id).populate('owner');
  }

  async delete(id: string, userId: string): Promise<Product> {
    const product = await this.productModule.findById(id);
    if (userId !== product.owner.toString()) {
      throw new HttpException(
        'You do not own this product',
        HttpStatus.UNAUTHORIZED,
      );
    }
    product.remove();
    return product.populate('owner');
  }
}
