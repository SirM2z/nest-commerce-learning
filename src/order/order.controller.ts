import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../utilities/user.decorator';
import { CreateOrderDTO } from './order.dto';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(AuthGuard())
  listOrder(@User('id') userId: string) {
    return this.orderService.listOrdersByUser(userId);
  }

  @Post()
  @UseGuards(AuthGuard())
  createOrder(@Body() orderDTO: CreateOrderDTO, @User('id') userId: string) {
    return this.orderService.createOrder(orderDTO, userId);
  }
}
