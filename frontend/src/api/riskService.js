import { riskApi } from './riskApi';

export const uploadPortfolioImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await riskApi.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const analyzePortfolio = async (holdings) => {
    const payload = {
        holdings: holdings
    };
    const response = await riskApi.post('/analyze', payload);
    return response.data;
};
