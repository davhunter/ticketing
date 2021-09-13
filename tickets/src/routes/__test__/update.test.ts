import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'blah',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'blah',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own teh ticket', async () => {
  const firstResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${firstResponse.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'new title',
      price: 1000,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const firstResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${firstResponse.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${firstResponse.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: -10,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();

  const firstResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${firstResponse.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 40,
    })
    .expect(200);

  const newResponse = await request(app)
    .get(`/api/tickets/${firstResponse.body.id}`)
    .send();

  expect(newResponse.body.title).toEqual('new title');
  expect(newResponse.body.price).toEqual(40);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const firstResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${firstResponse.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 40,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 40,
    })
    .expect(400);
});
