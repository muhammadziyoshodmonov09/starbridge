export function buildSuccessResponse(service, message, data) {
  return {
    ok: true,
    service,
    message,
    data
  };
}

export function buildErrorResponse(service, errorCode, message) {
  return {
    ok: false,
    service,
    error_code: errorCode,
    message
  };
}
