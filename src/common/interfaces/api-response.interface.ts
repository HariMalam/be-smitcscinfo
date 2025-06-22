import { ResponseStatus } from '../enums/response-status.enum';

export interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: any;
}

/**
 * What controllers return — flexible and clean.
 */
export interface ControllerResponse<T = any> {
  message?: string;
  data?: T;
  meta?: MetaData;
}

/**
 * Final formatted response sent to the client.
 */
export interface ApiResponse<T = any> {
  status: ResponseStatus;
  statusCode: number;
  message: string;
  requestId?: string;
  timestamp: string;
  data: T;
  meta?: MetaData;
}

export interface ApiErrorResponse {
  status: ResponseStatus;
  statusCode: number;
  message: string;
  requestId?: string;
  timestamp: string;
  errors?: any[];
}
