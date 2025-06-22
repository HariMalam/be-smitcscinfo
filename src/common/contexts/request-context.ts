import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  lang: string;
}

const asyncStorage = new AsyncLocalStorage<RequestContext>();

export function setRequestContext(ctx: RequestContext) {
  asyncStorage.enterWith(ctx);
}

export function getRequestContext(): RequestContext | undefined {
  return asyncStorage.getStore();
}

export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

export function getLang(): string {
  return getRequestContext()?.lang ?? 'en';
}
