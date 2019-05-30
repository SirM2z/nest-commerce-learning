import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../types/order';
import { CreateOrderDTO } from './order.dto';

@Injectable()
export class OrderService {
  constructor(@InjectModel('Order') private orderModule: Model<Order>) {}

  async listOrdersByUser(userId: string) {
    const orders = await this.orderModule
      .find({ owner: userId })
      .populate('owner')
      .populate('products.product');
    if (!orders) {
      throw new HttpException('No Orders Found', HttpStatus.NO_CONTENT);
    }
    return orders;
  }

  async createOrder(orderDTO: CreateOrderDTO, userId: string) {
    const { _id } = await this.orderModule.create({
      owner: userId,
      products: orderDTO.products,
      created: Date.now(),
    });
    let order = await this.orderModule
      .findById(_id)
      .populate('owner')
      .populate('products.product');
    const totalPrice = order.products.reduce((pre, item) => {
      const price = item.quantity * item.product.price;
      return pre + price;
    }, 0);

    await order.updateOne({ totalPrice });

    order = await this.orderModule
      .findById(_id)
      .populate('owner')
      .populate('products.product');
    return order;
  }
}
