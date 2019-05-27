import 'dotenv/config';
import { HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { RegisterDTO, LoginDTO } from '../src/auth/auth.dto';
import { app } from './constants';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true });
  await mongoose.connection.db.dropDatabase();
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Root', () => {
  it('should ping', () => {
    return request(app)
      .get('/')
      .expect(200)
      .expect({ Hello: 'World!' });
  });
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
        expect(body.user.username).toEqual('username');
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
        expect(body.user.username).toEqual('seller');
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
        expect(body.user.username).toEqual('username');
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
        expect(body.user.username).toEqual('seller');
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeTruthy();
      });
  });

  it('should seller auth guard', () => {
    return request(app)
      .get('/auth')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send(sellerRegister)
      .expect(({ body }) => {
        expect(body.auth).toEqual('works');
        expect(body.user.username).toEqual('seller');
        expect(body.user.password).toBeUndefined();
        expect(body.user.seller).toBeTruthy();
      })
      .expect(HttpStatus.OK);
  });
});
