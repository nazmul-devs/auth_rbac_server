import cuid from "cuid";
import { EventEmitter } from "events";
import { logger } from "../utils/logger";

type EventHandler<T = any> = (event: Event<T>) => Promise<void> | void;
type EventMap = Record<string, EventHandler[]>;

export interface Event<T = any> {
  id: string;
  name: string;
  timestamp: Date;
  correlationId?: string;
  origin: string;
  payload: T;
  metadata?: Record<string, any>;
}

class EventBus {
  private readonly emitter: EventEmitter;
  private readonly subscriptions: EventMap = {};
  private isConnected = false;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  /**
   * Publish an event to the bus
   */
  async publish<T = any>(
    eventName: string,
    payload: T,
    metadata?: {
      correlationId?: string;
      origin?: string;
      [key: string]: any;
    }
  ): Promise<Event<T>> {
    const event: Event<T> = {
      id: cuid(),
      name: eventName,
      timestamp: new Date(),
      correlationId: metadata?.correlationId,
      origin: metadata?.origin || "unknown",
      payload,
      metadata,
    };

    try {
      this.emitter.emit(eventName, event);

      // Emit to wildcard listeners
      this.emitter.emit("*", event);

      return event;
    } catch (error) {
      logger.error(`Failed to publish event: ${eventName}`);
      throw error;
    }
  }

  /**
   * Subscribe to an event
   */
  subscribe<T = any>(
    eventName: string | string[],
    handler: EventHandler<T>,
    options?: {
      once?: boolean;
    }
  ): () => void {
    const events = Array.isArray(eventName) ? eventName : [eventName];
    const unsubscribeFns: (() => void)[] = [];

    for (const name of events) {
      if (!this.subscriptions[name]) {
        this.subscriptions[name] = [];
      }

      const wrappedHandler = async (event: Event<T>) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(`Error handling event: ${name}`, { error, event });
        }
      };

      if (options?.once) {
        this.emitter.once(name, wrappedHandler);
      } else {
        this.emitter.on(name, wrappedHandler);
      }

      this.subscriptions[name].push(handler);

      unsubscribeFns.push(() => {
        this.emitter.off(name, wrappedHandler);
        this.subscriptions[name] = this.subscriptions[name]?.filter(
          (h) => h !== handler
        );
      });
    }

    return () => unsubscribeFns.forEach((fn) => fn());
  }

  /**
   * Subscribe to all events
   */
  subscribeToAll(handler: EventHandler): () => void {
    return this.subscribe("*", handler);
  }

  /**
   * Health check for BaseService integration
   */
  async healthCheck() {
    return {
      healthy: this.isConnected,
      listeners:
        this.emitter.listenerCount("*") +
        Object.keys(this.subscriptions).reduce(
          (sum, key) => sum + this.emitter.listenerCount(key),
          0
        ),
    };
  }

  /**
   * Connect the event bus (placeholder for distributed implementations)
   */
  async connect() {
    if (this.isConnected) return;

    try {
      this.isConnected = true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disconnect the event bus
   */
  async disconnect() {
    this.emitter.removeAllListeners();
    this.isConnected = false;
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions(): EventMap {
    return { ...this.subscriptions };
  }
}

// Singleton instance
export const eventBus = new EventBus();
