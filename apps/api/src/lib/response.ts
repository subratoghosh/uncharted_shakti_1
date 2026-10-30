import { FastifyReply } from 'fastify';
import {
  ApiErrorPayload,
  ApiFailureResponse,
  ApiResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorDetail,
  PaginationMeta,
} from '@shaktiq/shared';

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): FastifyReply {
  const response: ApiSuccessResponse<T> = {
    ok: true,
    data,
    meta,
  };
  return reply.status(statusCode).send(response);
}

export function sendError(
  reply: FastifyReply,
  code: ErrorCode,
  message: string,
  statusCode = 500,
  details?: ErrorDetail[],
): FastifyReply {
  const errorPayload: ApiErrorPayload = {
    code,
    message,
    details,
  };
  const response: ApiFailureResponse = {
    ok: false,
    error: errorPayload,
  };
  return reply.status(statusCode).send(response);
}
