import axios from 'axios';

// Axios calls to backend
export const riskApi = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust base URL as needed
});
