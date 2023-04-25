import {ErrorResponse} from '../types/api';

export function buildError(errorMsg: string): ErrorResponse {
  return {
    error: true,
    errorMsg,
  };
}
