import { Subjects, Publisher, PaymentCreatedEvent } from '@ticketsdh/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
