import { sendPremiumOrder } from '../../lib/api/providerService.js';
import { buildSuccessResponse, buildErrorResponse } from '../../lib/api/responseBuilder.js';
import { mapProviderError } from '../../lib/api/errorMapper.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json(buildErrorResponse("premium", "METHOD_NOT_ALLOWED", "Only POST requests are allowed."));
  }

  const { username, duration, seed, order_id } = req.body || {};

  // Request validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json(buildErrorResponse("premium", "VALIDATION_ERROR", "Field 'username' is required and must be a string."));
  }
  if (!duration || typeof duration !== 'number' || ![3, 6, 12].includes(duration)) {
    return res.status(400).json(buildErrorResponse("premium", "INVALID_DURATION", "Duration must be 3, 6, or 12 months."));
  }
  if (!seed || typeof seed !== 'string') {
    return res.status(400).json(buildErrorResponse("premium", "VALIDATION_ERROR", "Field 'seed' is required and must be a string."));
  }

  const payload = { username, duration, seed };
  if (order_id) {
    payload.order_id = order_id;
  }

  // Safely forward to the upstream provider via environment variables mapping
  const result = await sendPremiumOrder(payload);

  if (result.success) {
    const returnedOrderId = result.data?.order_id || order_id || null;
    const cost = result.data?.cost || null; 

    // Formulate our clean normalized response
    const finalData = {
      order_id: returnedOrderId,
      username: username,
      duration: duration,
      cost: cost
    };

    // Strip nulls
    Object.keys(finalData).forEach(key => finalData[key] === null && delete finalData[key]);

    return res.status(200).json(buildSuccessResponse("premium", "Order successfully processed.", finalData));
  } else {
    // Graceful error mapping
    const mappedErr = mapProviderError(result.data, "premium");
    return res.status(mappedErr.status).json(buildErrorResponse("premium", mappedErr.errorCode, mappedErr.message));
  }
}
