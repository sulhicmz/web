import type { IErrorMessageProvider } from './error-message-provider.interface';
import { DefaultErrorMessageProvider } from './default-error-message-provider';

let messageProvider: IErrorMessageProvider = new DefaultErrorMessageProvider();

export function setMessageProvider(provider: IErrorMessageProvider): void {
  messageProvider = provider;
}

export function getMessageProvider(): IErrorMessageProvider {
  return messageProvider;
}

export function resetMessageProvider(): void {
  messageProvider = new DefaultErrorMessageProvider();
}
