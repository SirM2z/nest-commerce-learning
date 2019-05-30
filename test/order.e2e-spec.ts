import { HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import axios from 'axios';
import { RegisterDTO, LoginDTO } from '../src/auth/auth.dto';
import { app, database } from './constants';
import { CreateProductDTO, UpdateProductDTO } from '../src/product/product.dto';
import { Product } from '../src/types/product';

let buyerToken: string;
let sellerToekn: string;
let boughtProducts: Product[];
const orderBuyer: RegisterDTO = {
  username: 'orderBuyer',
  password: 'password',
  seller: false,
};
const orderSeller: RegisterDTO = {
  username: 'orderSeller',
  password: 'password',
  seller: true,
};
const soldProducts: CreateProductDTO[] = [
  {
    title: 'new phone',
    description: 'very a cool phone',
    image: 'n/a',
    price: 888,
  },
  {
    title: 'new tv',
    description: 'very a cool tv',
    image: 'n/a',
    price: 666,
  },
];

beforeAll(async () => {
  await mongoose.connect(database, { useNewUrlParser: true });
  await mongoose.connection.db.dropDatabase();

  ({
    data: { token: buyerToken },
  } = await axios.post(`${app}/auth/register`, orderBuyer));
  ({
    data: { token: sellerToekn },
  } = await axios.post(`${app}/auth/register`, orderSeller));

  const [{ data: data1 }, { data: data2 }] = await Promise.all(
    soldProducts.map(product =>
      axios.post(`${app}/product`, product, {
        headers: { Authorization: `Bearer ${sellerToekn}` },
      }),
    ),
  );
  boughtProducts = [data1, data2];
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Order', () => {
  it('should create order of all products', async () => {
    const orderDTO = {
      products: boughtProducts.map(product => ({
        product: product._id,
        quantity: 1,
      })),
    };

    return request(app)
      .post('/order')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send(orderDTO)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        console.log(body);
        expect(body.owner.username).toEqual(orderBuyer.username);
        expect(body.products.length).toEqual(boughtProducts.length);
        expect(
          body.products
            .map(product => product._id)
            .includes(body.products[0].product._id),
        ).toBeTruthy();
        expect(body.totalPrice).toEqual(
          boughtProducts.reduce((pre, product) => pre + product.price, 0),
        );
      });
  });

  it('should list all orders of buyer', () => {
    return request(app)
      .get('/order')
      .set('Accept', 'Application/json')
      .set('Authorization', `Bearer ${orderSeller}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.length).toEqual(1);
        expect(body[0].products.lenght).toEqual(boughtProducts.length);
        expect(
          boughtProducts
            .map(product => product._id)
            .includes(body[0].products[0].product._id),
        ).toBeTruthy();
      });
  });
});
