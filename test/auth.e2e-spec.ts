import { HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { RegisterDTO, LoginDTO } from '../src/auth/auth.dto';
import { app, database } from './constants';

beforeAll(async () => {
  await mongoose.connect(database, { useNewUrlParser: true });
  await mongoose.connection.db.dropDatabase();
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Auth', () => {
  const user: RegisterDTO | LoginDTO = {
    username: 'username',
    password: 'password',
  };

  const sellerRegister: RegisterDTO = {
    username: 'seller',
    password: 'password',
    seller: true,
  };

  const sellerLogin: LoginDTO = {
    username: 'seller',
    password: 'password',
  };

  let sellerToken: string;

  it('should register user', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual(user.username);
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeFalsy();
      })
      .expect(HttpStatus.CREATED);
  });

  it('should register seller', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(sellerRegister)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual(sellerRegister.username);
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeTruthy();
        sellerToken = body.token;
      });
  });

  it('should reject dupcliate registration', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.code).toEqual(HttpStatus.BAD_REQUEST);
        expect(body.message).toEqual('User already exists');
      });
  });

  it('should login user', () => {
    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(user)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual(user.username);
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeFalsy();
      });
  });

  it('should login seller', () => {
    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(sellerLogin)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual(sellerLogin.username);
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeTruthy();
      });
  });

  it('should respect seller token', () => {
    return request(app)
      .get('/product/mine')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(HttpStatus.OK);
  });
});
