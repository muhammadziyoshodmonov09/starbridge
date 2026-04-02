import axios from 'axios';

const getBaseUrl = () => process.env.PROVIDER_BASE_URL || '';
const getTimeout = () => parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

export async function sendStarsOrder(payload) {
  const url = `${getBaseUrl()}${process.env.PROVIDER_STARS_PATH || ''}`;
  try {
    const response = await axios.post(url, payload, {
      timeout: getTimeout(),
      headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, data: error.response.data, status: error.response.status };
    } else if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return { success: false, data: { error: 'FRAGMENT_TIMEOUT' }, status: 503 };
    }
    return { success: false, data: { error: error.message } };
  }
}

export async function sendPremiumOrder(payload) {
  const url = `${getBaseUrl()}${process.env.PROVIDER_PREMIUM_PATH || ''}`;
  try {
    const response = await axios.post(url, payload, {
      timeout: getTimeout(),
      headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { success: false, data: error.response.data, status: error.response.status };
    } else if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return { success: false, data: { error: 'FRAGMENT_TIMEOUT' }, status: 503 };
    }
    return { success: false, data: { error: error.message } };
  }
}
