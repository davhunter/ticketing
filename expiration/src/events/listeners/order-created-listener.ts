import { Listener, OrderCreatedEvent, Subjects } from '@ticketsdh/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQ } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting this many milliseconds to process the job: ${delay}`);

    await expirationQ.add({ orderId: data.id }, { delay });

    msg.ack();
  }
}
