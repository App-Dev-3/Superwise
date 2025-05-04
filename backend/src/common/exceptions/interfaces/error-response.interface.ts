export interface ErrorResponse {
  statusCode: number;
  message: string;
  detail?: string;
  timestamp: string;
  path: string;
}
