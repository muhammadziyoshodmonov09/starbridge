export function mapProviderError(errorResponse, service) {
  // If no error context is provided, return a generic error
  if (!errorResponse) {
    return { status: 500, errorCode: 'UNKNOWN_ERROR', message: 'An unknown upstream anomaly occurred.' };
  }

  const rawString = JSON.stringify(errorResponse).toUpperCase();
  
  if (rawString.includes('VALIDATION_ERROR')) return { status: 400, errorCode: 'VALIDATION_ERROR', message: 'Invalid request parameters sent to provider.' };
  if (rawString.includes('PENDING_TRANSACTION')) return { status: 409, errorCode: 'PENDING_TRANSACTION', message: 'A transaction is already pending for this user.' };
  if (rawString.includes('INVALID_AMOUNT_MIN')) return { status: 400, errorCode: 'INVALID_AMOUNT_MIN', message: 'Amount is below the minimum threshold.' };
  if (rawString.includes('INVALID_AMOUNT_MAX')) return { status: 400, errorCode: 'INVALID_AMOUNT_MAX', message: 'Amount is above the maximum threshold.' };
  if (rawString.includes('INSUFFICIENT_FUNDS')) return { status: 400, errorCode: 'INSUFFICIENT_FUNDS', message: 'The upstream service indicated insufficient funds.' };
  if (rawString.includes('WALLET_VM_ERROR')) return { status: 400, errorCode: 'WALLET_VM_ERROR', message: 'Upstream wallet contract error.' };
  if (rawString.includes('FRAGMENT_API_ERROR') || rawString.includes('FRAGMENT_ERROR')) return { status: 400, errorCode: 'FRAGMENT_API_ERROR', message: 'Upstream fragment API error.' };
  if (rawString.includes('FRAGMENT_TIMEOUT')) return { status: 503, errorCode: 'FRAGMENT_TIMEOUT', message: 'The upstream service request timed out.' };
  if (rawString.includes('USER_TRANSFER_FAIL')) return { status: 400, errorCode: 'USER_TRANSFER_FAIL', message: 'Could not complete the provider transfer.' };
  if (rawString.includes('CRITICAL_SERVER_ERROR')) return { status: 500, errorCode: 'CRITICAL_SERVER_ERROR', message: 'The upstream server experienced a critical failure.' };

  // Arbitrary bad requests from provider that don't match specific strings
  if (errorResponse.status && errorResponse.status >= 400 && errorResponse.status < 500) {
     return { status: 400, errorCode: 'PROVIDER_BAD_REQUEST', message: 'The provider rejected the request payload.' };
  }
  
  return { status: 500, errorCode: 'PROVIDER_ERROR', message: 'Upstream provider failed to successfully process the request.' };
}
