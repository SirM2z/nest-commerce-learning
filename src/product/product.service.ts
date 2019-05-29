import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../types/product';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { User } from '../types/user';

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
    return await this.productModule.findById(id).populate('owner');
  }

  async findOne(id: string): Promise<Product> {
    return await this.productModule.findById(id).populate('owner');
  }

  async create(productDTO: CreateProductDTO, user: User): Promise<Product> {
    const product = await this.productModule.create({
      ...productDTO,
      owner: user,
      created: Date.now(),
    });
    await product.save();
    return product.populate('owner');
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
    await product.update(productDTO);
    return product.populate('owner');
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
