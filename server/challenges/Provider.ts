import { EventEmitter } from 'events'

export interface Provider extends EventEmitter {
  forceUpdate (): void;
  cleanup (): void;
}
