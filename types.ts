export interface PricePoint {
  date: string;
  price: number;
}

export interface MarketData {
  current_price: { usd: number };
  market_cap: { usd: number };
  market_cap_rank: number;
  total_volume: { usd: number };
  high_24h: { usd: number };
  low_24h: { usd: number };
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: { usd: number };
  ath_change_percentage: { usd: number };
  fully_diluted_valuation: { usd: number };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { tr: string; en: string };
  links: {
    homepage: string[];
    whitepaper: string[];
    blockchain_site: string[];
  };
  image: {
    large: string;
    small: string;
  };
  market_data: MarketData;
  sparkline_7d?: {
    price: number[];
  };
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb?: string;
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface SupplyPoint {
  date: string;
  supply: number;
}