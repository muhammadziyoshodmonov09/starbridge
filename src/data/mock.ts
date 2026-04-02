export const apiDocs = {
  stars: {
    id: 'stars',
    title: 'Telegram Stars Purchase (Fragment Integration)',
    description: 'This endpoint allows purchasing Telegram Stars for a specific username using TON wallet payment.',
    endpoint: 'POST https://starbridge-vert.vercel.app/api/stars/buy',
    requestBody: [
      { field: 'username', type: 'string', required: true, description: 'Telegram username (without @)' },
      { field: 'amount', type: 'int', required: true, description: 'Stars amount (min: 50)' },
      { field: 'seed', type: 'string', required: true, description: 'Mnemonic phrase (12/24 words)' },
      { field: 'order_id', type: 'string', required: false, description: 'Custom order ID' }
    ],
    exampleRequest: `curl -X POST "https://starbridge-vert.vercel.app/api/stars/buy" \\
-H "Content-Type: application/json" \\
-d '{
  "username": "monk",
  "amount": 50,
  "seed": "apple banana cherry ...",
  "order_id": "ORD-001"
}'`,
    successResponse: `{
  "ok": true,
  "message": "Stars successfully sent.",
  "order_id": "ORD-001",
  "username": "monk",
  "stars_amount": 50,
  "cost": 0.5
}`,
    errorResponses: [
      { code: '400 VALIDATION_ERROR', message: 'Invalid request data.' },
      { code: '409 PENDING_TRANSACTION', message: 'Order is already processing.' },
      { code: '400 INVALID_AMOUNT_MIN', message: 'Minimum is 50 stars.' },
      { code: '400 INVALID_AMOUNT_MAX', message: 'Maximum is 1,000,000 stars.' },
      { code: '400 INSUFFICIENT_FUNDS', message: 'Not enough TON balance.' },
      { code: '400 WALLET_ERROR', message: 'Invalid seed phrase.' },
      { code: '400 FRAGMENT_ERROR', message: 'Fragment processing failed.' },
      { code: '503 TIMEOUT', message: 'Fragment did not respond.' },
      { code: '500 SERVER_ERROR', message: 'Internal server error.' }
    ]
  },
  premium: {
    id: 'premium',
    title: 'Telegram Premium Activation',
    description: 'This endpoint sends Telegram Premium subscription as a gift to a user.',
    endpoint: 'POST https://starbridge-vert.vercel.app/api/premium/buy',
    requestBody: [
      { field: 'username', type: 'string', required: true, description: 'Telegram username (without @)' },
      { field: 'duration', type: 'int', required: true, description: '3, 6 or 12 months' },
      { field: 'seed', type: 'string', required: true, description: 'Mnemonic phrase (24 words)' },
      { field: 'order_id', type: 'string', required: false, description: 'Custom order ID' }
    ],
    exampleRequest: `curl -X POST "https://starbridge-vert.vercel.app/api/premium/buy" \\
-H "Content-Type: application/json" \\
-d '{
  "username": "monk",
  "duration": 6,
  "seed": "apple banana cherry ...",
  "order_id": "ORD-12345"
}'`,
    successResponse: `{
  "ok": true,
  "message": "Premium successfully activated.",
  "order_id": "ORD-12345",
  "username": "monk",
  "duration": 6,
  "cost": 18.2
}`,
    errorResponses: [
      { code: '400 VALIDATION_ERROR', message: 'Invalid username or duration.' },
      { code: '400 INVALID_DURATION', message: 'Only 3, 6, 12 allowed.' },
      { code: '400 INSUFFICIENT_FUNDS', message: 'Not enough balance.' },
      { code: '400 WALLET_ERROR', message: 'Invalid seed phrase.' },
      { code: '400 FRAGMENT_ERROR', message: 'User already has premium or fragment issue.' },
      { code: '503 TIMEOUT', message: 'Fragment not responding.' },
      { code: '500 SERVER_ERROR', message: 'Internal server error.' }
    ]
  }
};
