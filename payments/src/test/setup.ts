import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

let mongo: any;

jest.mock('../nats-wrapper');

beforeAll(async () => {
  process.env.JWT_KEY = 'blah';

  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // build a JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build the sesion object
  const sessionObj = { jwt: token };

  // turn that session into JSON
  const sessionJSON = JSON.stringify(sessionObj);

  // encode as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a string that's the cookie with the encoded data
  return [`express:sess=${base64}`];
};
