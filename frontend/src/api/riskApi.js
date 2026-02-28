import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8088/api';
const baseURL = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = baseURL;

const riskApi = axios.create({
  baseURL,
  timeout: 60000,
});

export async function analyzePortfolio(holdings) {
  const payload = { holdings };
  const response = await riskApi.post('/analyze', payload);
  return response.data;
}

export async function uploadPortfolioImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await riskApi.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
