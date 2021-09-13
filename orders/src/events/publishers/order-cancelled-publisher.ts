import { Subjects, Publisher, OrderCancelledEvent } from '@ticketsdh/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
