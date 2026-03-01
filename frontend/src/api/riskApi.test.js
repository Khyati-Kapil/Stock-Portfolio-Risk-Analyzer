import axios from 'axios';
import { API_BASE_URL, analyzePortfolio, uploadPortfolioImage } from './riskApi';

jest.mock('axios', () => {
  const post = jest.fn();
  return {
    create: jest.fn(() => ({ post })),
    __mockPost: post,
  };
});

const mockPost = axios.__mockPost;

describe('riskApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('posts holdings to /analyze', async () => {
    mockPost.mockResolvedValueOnce({ data: { ok: true } });

    const holdings = [{ ticker: 'RELIANCE.NS', weight: 1 }];
    const result = await analyzePortfolio(holdings);

    expect(mockPost).toHaveBeenCalledWith('/analyze', { holdings });
    expect(result).toEqual({ ok: true });
  });

  it('uploads image using multipart form data', async () => {
    mockPost.mockResolvedValueOnce({ data: { tickers: ['TCS.NS'] } });

    const file = new File(['img'], 'portfolio.png', { type: 'image/png' });
    const result = await uploadPortfolioImage(file);

    expect(mockPost.mock.calls[0][0]).toBe('/upload');
    expect(mockPost.mock.calls[0][1]).toBeInstanceOf(FormData);
    expect(mockPost.mock.calls[0][2]).toMatchObject({
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      maxBodyLength: Infinity,
    });
    expect(result).toEqual({ tickers: ['TCS.NS'] });
  });

  it('creates axios client with environment-aware base URL', () => {
    expect(API_BASE_URL).toBeTruthy();
    expect(API_BASE_URL.includes('/api')).toBe(true);
  });
});
