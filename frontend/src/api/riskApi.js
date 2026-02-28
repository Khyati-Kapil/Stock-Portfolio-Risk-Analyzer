import axios from 'axios';

const riskApi = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 60000,
});

export async function analyzePortfolio(payload) {
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
