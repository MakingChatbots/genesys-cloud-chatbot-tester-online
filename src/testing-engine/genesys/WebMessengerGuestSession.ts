import { Response } from "./Response.ts";
import { SessionResponse } from "./SessionResponse.ts";
import { StructuredMessage } from "./StructuredMessage.ts";
import { MessageDelayer } from "./message-delayer/MessageDelayer.ts";
import { ReorderedMessageDelayer } from "./message-delayer/ReorderedMessageDelayer.ts";

export interface WebMessengerSession extends EventTarget {
  get messageDelayInMs(): number;
  sendText(message: string): void;
  close(): void;
}

export interface SessionConfig {
  readonly deploymentId: string;
  readonly region: string;
  readonly origin?: string | undefined;
}

function isSessionResponse(
  message: Response<unknown>,
): message is SessionResponse {
  return message.type === "response" && message.class === "SessionResponse";
}

export function isStructuredMessage(
  message: Response<unknown>,
): message is StructuredMessage {
  return message.type === "message" && message.class === "StructuredMessage";
}

export type OnErrorCallback = (
  // Distinction is for detecting errors when connecting, which browsers prevent you finding out. see @hasConnected
  errorType: "pre-connected" | "post-connected",
  errorMessage: string,
) => void;

export class WebMessengerGuestSession extends EventTarget {
  // private static readonly debugger = debug('WebMessengerGuestSession');

  private readonly sessionToken: string;
  private readonly ws: WebSocket;

  /**
   * Used to determine if an error occurred during the connection. You do not get
   * an error for this. See link below for more info:
   * https://stackoverflow.com/questions/31002592/javascript-doesnt-catch-error-in-websocket-instantiation
   * @private
   */
  private hasConnected: boolean = false;

  constructor(
    private readonly config: SessionConfig,
    private readonly logger: (overview: string, detailed?: any) => void,
    private readonly onError: OnErrorCallback,
    private readonly participantData: Record<string, string> = {},
    private readonly messageDelayer: MessageDelayer = new ReorderedMessageDelayer(),
    readonly wsFactory = (url: string) => new WebSocket(url),
  ) {
    super();
    this.sessionToken = self.crypto.randomUUID();

    const url = `wss://webmessaging.${this.config.region}/v1?deploymentId=${this.config.deploymentId}`;
    this.logger("Connecting to WebSocket", url);

    this.ws = wsFactory(url);
    this.ws.onclose = (event) => {
      console.log("Closed WebSocket connection", event);
    };
    this.ws.onerror = (event) => {
      if (!this.hasConnected) {
        this.onError("pre-connected", `Failed to connect to ${url}`);
      } else {
        const errorMessage =
          event instanceof ErrorEvent ? event.message : "Unknown error";
        this.onError("post-connected", errorMessage);
      }
    };
    this.ws.onopen = () => {
      this.hasConnected = true;
      this.connected();
    };
    this.ws.onmessage = (event) => this.messageReceived(event.data);

    messageDelayer.addEventListener("message", (event: Event) => {
      const message = (event as CustomEvent<Response<unknown>>).detail;
      this.processMessage(message);
    });
  }

  public get messageDelayInMs(): number {
    return this.messageDelayer.delay;
  }

  private connected(): void {
    const payload = {
      action: "configureSession",
      deploymentId: this.config.deploymentId,
      token: this.sessionToken,
    };

    this.logger("Sending JSON payload", payload);
    this.ws.send(JSON.stringify(payload));
  }

  private processMessage(message: Response<unknown>): void {
    if (isSessionResponse(message)) {
      this.dispatchEvent(
        new CustomEvent("sessionStarted", { detail: message }),
      );
      return;
    }

    if (isStructuredMessage(message)) {
      this.dispatchEvent(
        new CustomEvent("structuredMessage", { detail: message }),
      );
      return;
    }

    console.log("Unknown message", message);
  }

  private messageReceived(data: any): void {
    const payload = JSON.parse(data);
    if (typeof payload.type !== "string") {
      throw new Error(`Unexpected payload: ${payload}`);
    }

    this.logger("Received JSON payload", payload);

    const message = payload as Response<unknown>;

    if (message.code !== 200) {
      throw Error(
        `Session Response was ${message.code} instead of 200 due to '${message.body}'`,
      );
    }

    this.messageDelayer.add(message, new Date());
  }

  public sendText(message: string): void {
    const payload = {
      action: "onMessage",
      token: this.sessionToken,
      message: {
        type: "Text",
        text: message,
      },
      ...(Object.keys(this.participantData).length === 0
        ? {}
        : {
            channel: {
              metadata: {
                customAttributes: this.participantData ?? {},
              },
            },
          }),
    };

    this.logger("Sending JSON payload", payload);
    this.ws.send(JSON.stringify(payload));
  }

  public close(): void {
    this.ws.close();
  }
}
