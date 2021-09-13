import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@ticketsdh/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
