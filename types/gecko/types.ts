export interface GeckoCoinDetail {
  additional_notices: any[];
  asset_platform_id: null | string;
  block_time_in_minutes: number;
  categories: string[];
  community_data: {
    facebook_likes: null | number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    [key: string]: any;
  };
  country_origin: string;
  description: {
    [key: string]: any;
  };
  detail_platforms: {
    [key: string]: {
      decimal_place: null | number;
      contract_address: string;
    };
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    [key: string]: any;
  };
  genesis_date: null | string;
  hashing_algorithm: null | string;
  ico_data: {
    ico_start_date: null | string;
    ico_end_date: null | string;
    short_desc: string;
    [key: string]: any;
  };
  id: string;
  image: {
    thumb: string;
    [key: string]: any;
  };
  last_updated: string;
  links: {
    homepage: string[];
    whitepaper: string;
    [key: string]: any;
  };
  localization: {
    en: string;
    de: string;
    es: string;
    fr: string;
    it: string;
    pl: string;
    ro: string;
    [key: string]: any;
  };
  market_cap_rank: number;
  market_data: {
    [key: string]: any;
  };
  name: string;
  platforms: {
    [key: string]: string;
  };
  preview_listing: boolean;
  public_notice: null | string;
  sentiment_votes_down_percentage: number;
  sentiment_votes_up_percentage: number;
  status_updates: any[];
  symbol: string;
  tickers: {
    base: string;
    target: string;
    [key: string]: any;
  }[];
  watchlist_portfolio_users: number;
  web_slug: string;
}

export interface GeckoTrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  data: {
    price: number;
    price_btc: string;
    price_change_percentage_24h: {
      [key: string]: number;
    };
  };
  content: null;
  market_cap: string;
  market_cap_btc: string;
  price: number;
  price_btc: string;
  sparkline: string;
  total_volume: string;
  total_volume_btc: string;
  large: string;
  score: number;
  slug: string;
  small: string;
  thumb: string;
}
