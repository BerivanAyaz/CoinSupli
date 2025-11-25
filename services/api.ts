import { CoinDetail, SearchResult, MarketChartData } from "../types";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Basit bir cache mekanizması (API limitlerini korumak için)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 dakika
const CHART_CACHE_DURATION = 5 * 60 * 1000; // Chart verisi 5 dakika cache

// Yardımcı: API hatalarını yönet
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("API_LIMIT");
    }
    if (response.status === 404) {
      throw new Error("NOT_FOUND");
    }
    throw new Error(`GENERIC_ERROR:${response.status}`);
  }
  return response.json();
};

export const searchCoin = async (query: string): Promise<SearchResult[]> => {
  const url = `${BASE_URL}/search?query=${query}`;
  const data = await fetch(url).then(handleResponse);
  return data.coins || [];
};

export const getCoinDetails = async (coinId: string): Promise<CoinDetail> => {
  // Cache kontrolü
  const cached = cache.get(`details_${coinId}`);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
  
  const data = await fetch(url).then(handleResponse);

  // Veriyi cache'e at
  cache.set(`details_${coinId}`, { data, timestamp: Date.now() });
  
  return data;
};

export const getCoinMarketChart = async (coinId: string, days: number = 365): Promise<MarketChartData> => {
  const cacheKey = `chart_${coinId}_${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CHART_CACHE_DURATION) {
    return cached.data;
  }

  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
  const data = await fetch(url).then(handleResponse);

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}