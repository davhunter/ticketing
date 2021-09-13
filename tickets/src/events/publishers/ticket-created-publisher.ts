import { Publisher, Subjects, TicketCreatedEvent } from '@ticketsdh/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
