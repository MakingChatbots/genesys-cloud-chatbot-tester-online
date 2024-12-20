import debug from 'debug';
import { Response } from '../Response.ts';
import { orderByTimestamp } from './orderByTimestamp.ts';
import { MessageDelayer } from './MessageDelayer.ts';
import { isStructuredMessage } from '../WebMessengerGuestSession.ts';
import { StructuredMessage } from '../StructuredMessage.ts';

export interface ReceivedMsg<T extends StructuredMessage | Response<unknown>> {
  received: Date;
  response: T;
}

/**
 * Reorders messages with a timestamp, being sure to maintain the overall order of messages with/without
 * timestamps.
 *
 * > All messaging follows a request/response pattern. However, web messaging is an asynchronous
 * > channel and therefore no guarantee to ordering is provided.
 * > Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#messaging
 */
export class ReorderedMessageDelayer extends EventTarget implements MessageDelayer {
  private static readonly debugger = debug('ReorderedMessageDelayer');

  private messages: ReceivedMsg<Response<unknown>>[] = [];

  private lastMessageWithTimestamp: StructuredMessage | undefined = undefined;

  private intervalReference: number | undefined;

  private unorderedMessageOccurred = false;

  constructor(
    private readonly delayBeforeEmittingInMs: number = 1000,
    private readonly intervalInMs: number = 1000,
  ) {
    super();
    if (intervalInMs <= 0) {
      throw new Error('Interval must be greater than 0');
    }
  }

  private logUnorderedMessageTimeDiff(message: Response<unknown>): void {
    if (isStructuredMessage(message)) {
      if (this.lastMessageWithTimestamp) {
        const timeDifference =
          new Date(message.body.channel.time).getTime() -
          new Date(this.lastMessageWithTimestamp.body.channel.time).getTime();

        if (timeDifference < 0) {
          this.unorderedMessageOccurred = true;
          ReorderedMessageDelayer.debugger(
            "Message received was out of order. Last msg's timestamp came before this one by %d ms",
            -timeDifference,
          );
        } else {
          // If timeDifference check above is true then last message is more recent so keep, else update below
          this.lastMessageWithTimestamp = message;
        }
      } else {
        this.lastMessageWithTimestamp = message;
      }
    }
  }

  public get unorderdMessageDetected(): boolean {
    return this.unorderedMessageOccurred;
  }

  /**
   * Add a message to the pool. Each message added reset a timer to wait for any other messages
   * before releasing the oldest message.
   */
  public add(message: Response<unknown>, received: Date): void {
    this.logUnorderedMessageTimeDiff(message);

    this.messages.push({ received, response: message });

    if (!this.intervalReference) {
      this.startInterval();
    }
  }

  private startInterval(): void {
    if (!this.intervalReference) {
      this.intervalReference = setInterval(
        () => this.emitMessagesAfterSilence(),
        this.intervalInMs,
      ) as unknown as number;
      ReorderedMessageDelayer.debugger('Interval started');
    }
  }

  private stopInterval(): void {
    if (this.intervalReference) {
      clearInterval(this.intervalReference as unknown as NodeJS.Timeout);
      this.intervalReference = undefined;
      ReorderedMessageDelayer.debugger('Interval stopped');
    }
  }

  private emitMessagesAfterSilence(): void {
    const result = orderByTimestamp(this.messages);
    if (result.wasRearranged) {
      ReorderedMessageDelayer.debugger(
        'Flushing messages. Out of order message detected: %O',
        this.messages,
      );
    } else {
      ReorderedMessageDelayer.debugger('Flushing messages. No out of order messages');
    }

    this.messages = result.responses;

    if (isStructuredMessage(this.messages[0].response)) {
      const now = new Date().getTime();
      const ageOfMessageInMs = now - this.messages[0].received.getTime();
      if (ageOfMessageInMs >= this.delayBeforeEmittingInMs) {
        const message = this.messages.shift()?.response;
        this.dispatchEvent(new CustomEvent('message', { detail: message }));
        ReorderedMessageDelayer.debugger('Emitted message with timestamp: %O', {
          msDelayed: ageOfMessageInMs,
          message,
        });
      }
    } else {
      const message = this.messages.shift()?.response;
      // No timestamp so just emit
      this.dispatchEvent(new CustomEvent('message', { detail: message }));
      ReorderedMessageDelayer.debugger('Emitted message without timestamp %O', message);
    }

    if (this.messages.length === 0) {
      this.stopInterval();
      return;
    }
  }

  public get delay(): number {
    return this.delayBeforeEmittingInMs;
  }
}
