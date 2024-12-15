import { WebMessengerSession } from '../genesys/WebMessengerGuestSession.ts';
import { StructuredMessage } from '../genesys/StructuredMessage.ts';

export interface TranscribedMessage {
  who: string;
  message: string;

  toString(): string;
}

// TODO Implement this on other emitters
export declare interface Transcriber {
  addEventListener(event: 'messageTranscribed', listener: (event: CustomEvent<TranscribedMessage>) => void): void;
  addEventListener(event: string, listener: (event: Event) => void): void;
}

/**
 * Transcribes a Web Messenger session into an array of transcribed messages.
 */
export class SessionTranscriber extends EventTarget {
  private readonly conversation: TranscribedMessage[];

  private readonly _nameForClient: string;
  private readonly _nameForServer: string;

  constructor(
    private readonly messengerSession: WebMessengerSession,
    {
      nameForClient = 'You',
      nameForServer = 'Them',
    }: { nameForClient?: string; nameForServer?: string } = {},
  ) {
    super();
    this.conversation = [];
    this._nameForClient = nameForClient;
    this._nameForServer = nameForServer;

    this.messengerSession.addEventListener('structuredMessage', (event: Event) => {
      const message = (event as CustomEvent<StructuredMessage>).detail;
      this.recordStructuredMessage(message);
    });
  }

  private recordStructuredMessage(event: StructuredMessage): void {
    if (event.body.type !== 'Text' && event.body.type !== 'Structured') {
      return;
    }

    const who = event.body.direction === 'Inbound' ? this._nameForClient : this._nameForServer;
    const message = event.body.text;

    const interaction: TranscribedMessage = {
      who,
      message,
      toString: (): string => {
        return `${who}: ${message}`;
      },
    };

    this.conversation.push(interaction);
    this.emitInteraction(interaction);
  }

  private emitInteraction(interaction: TranscribedMessage): void {
    this.dispatchEvent(new CustomEvent('messageTranscribed', { detail: interaction }));
  }

  public getTranscript(): TranscribedMessage[] {
    return this.conversation;
  }
}
