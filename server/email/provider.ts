export interface Mail {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Provider {
  send (options: Mail): Promise<void>;
}

export interface ProviderConstructor {
  new (options: unknown): Provider
}
