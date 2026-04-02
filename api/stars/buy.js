import { sendStarsOrder } from '../../lib/api/providerService.js';
import { buildSuccessResponse, buildErrorResponse } from '../../lib/api/responseBuilder.js';
import { mapProviderError } from '../../lib/api/errorMapper.js';
import { createPendingTransaction, completeTransaction } from '../../lib/api/transactionService.js';

export default async function handler(req, res) {
  // Allow OPTIONS method for CORS if needed, but primarily strict POST
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json(buildErrorResponse("stars", "METHOD_NOT_ALLOWED", "Only POST requests are allowed."));
  }

  const { username, amount, seed, order_id } = req.body || {};

  // Request Validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json(buildErrorResponse("stars", "VALIDATION_ERROR", "Field 'username' is required and must be a string."));
  }
  if (!amount || typeof amount !== 'number' || !Number.isInteger(amount)) {
    return res.status(400).json(buildErrorResponse("stars", "VALIDATION_ERROR", "Field 'amount' is required and must be an integer."));
  }
  if (amount < 50 || amount > 1000000) {
    return res.status(400).json(buildErrorResponse("stars", "INVALID_AMOUNT_MIN", "Amount must be between 50 and 1000000."));
  }
  if (!seed || typeof seed !== 'string') {
    return res.status(400).json(buildErrorResponse("stars", "VALIDATION_ERROR", "Field 'seed' is required and must be a string."));
  }

  const payload = { username, amount, seed };
  if (order_id) {
    payload.order_id = order_id;
  }

  // 1. Create pending transaction in database
  const txId = await createPendingTransaction({
    service: 'stars',
    username,
    amount,
    order_id
  });

  // Hide the upstream call inside the backend
  const result = await sendStarsOrder(payload);

  if (result.success) {
    // Map upstream success properties gracefully so we never crash if provider omits fields
    const returnedOrderId = result.data?.order_id || order_id || null;
    // Make sure we remove nulls internally before sending but save raw costs
    const cost = result.data?.cost || null; 

    // Update database log
    await completeTransaction(txId, {
      status: 'success',
      ton_cost: cost
    });

    // Format the clean data we return back to our frontend
    const finalData = {
      order_id: returnedOrderId,
      username: username,
      amount: amount,
      cost: cost
    };

    // Remove null keys for cleaner JSON
    Object.keys(finalData).forEach(key => finalData[key] === null && delete finalData[key]);

    return res.status(200).json(buildSuccessResponse("stars", "Order successfully processed.", finalData));
  } else {
    // If the provider fails, normalize their error so we don't leak anything dangerous
    const mappedErr = mapProviderError(result.data, "stars");
    
    // Update database log indicating failure
    await completeTransaction(txId, {
      status: 'failed',
      provider_error_code: mappedErr.errorCode,
      provider_message: mappedErr.message
    });
    
    return res.status(mappedErr.status).json(buildErrorResponse("stars", mappedErr.errorCode, mappedErr.message));
  }
}
