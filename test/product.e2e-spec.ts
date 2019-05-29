import { HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import axios from 'axios';
import { RegisterDTO, LoginDTO } from '../src/auth/auth.dto';
import { app, database } from './constants';
import { CreateProductDTO, UpdateProductDTO } from '../src/product/product.dto';

let sellerToken: string;
const productSeller: RegisterDTO = {
  username: 'productSeller',
  password: 'password',
  seller: true,
};

beforeAll(async () => {
  await mongoose.connect(database, { useNewUrlParser: true });
  await mongoose.connection.db.dropDatabase();

  const {
    data: { token },
  } = await axios.post(`${app}/auth/register`, productSeller);
  sellerToken = token;
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Product', () => {
  const createProduct: CreateProductDTO = {
    title: 'test product',
    description: 'test product description',
    image: 'test product description',
    price: 888,
  };

  const updateProduct: UpdateProductDTO = {
    title: 'update test product',
    description: 'update test product description',
    image: 'update test product description',
    price: 8888,
  };

  let productId: string;

  it('should list all products', () => {
    return request(app)
      .get('/product')
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK);
  });

  it('should list my products', () => {
    return request(app)
      .get('/product/mine')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(HttpStatus.OK);
  });

  it('should create product', () => {
    return request(app)
      .post('/product')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send(createProduct)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body.title).toEqual(createProduct.title);
        expect(body.description).toEqual(createProduct.description);
        expect(body.image).toEqual(createProduct.image);
        expect(body.price).toEqual(createProduct.price);
        expect(body.owner.username).toEqual(productSeller.username);
        expect(body.owner.seller).toBeTruthy();
        productId = body._id;
      });
  });

  it('should read product', () => {
    return request(app)
      .get(`/product/seller/${productId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body._id).toEqual(productId);
        expect(body.title).toEqual(createProduct.title);
        expect(body.description).toEqual(createProduct.description);
        expect(body.image).toEqual(createProduct.image);
        expect(body.price).toEqual(createProduct.price);
        expect(body.owner.username).toEqual(productSeller.username);
        expect(body.owner.seller).toBeTruthy();
      });
  });

  it('should update product', () => {
    return request(app)
      .put(`/product/${productId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send(updateProduct)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body._id).toEqual(productId);
        expect(body.title).toEqual(updateProduct.title);
        expect(body.description).toEqual(updateProduct.description);
        expect(body.image).toEqual(updateProduct.image);
        expect(body.price).toEqual(updateProduct.price);
        expect(body.owner.username).toEqual(productSeller.username);
        expect(body.owner.seller).toBeTruthy();
      });
  });

  it('should delete product', async () => {
    await axios.delete(`${app}/product/${productId}`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    return request(app)
      .get(`/product/${productId}`)
      .expect(HttpStatus.NO_CONTENT);
  });
});
