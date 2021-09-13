import { Publisher, Subjects, TicketUpdatedEvent } from '@ticketsdh/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
