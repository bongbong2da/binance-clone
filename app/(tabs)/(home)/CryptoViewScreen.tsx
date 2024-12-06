import React from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components/native";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";

interface CoinDetails {
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

const CryptoView = () => {
  const navigation = useNavigation();
  const { cryptoId } = useLocalSearchParams();

  const getCoinQuery = useQuery<CoinDetails>({
    queryKey: ["getCoin"],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + `/coins/${cryptoId}`,
        {},
      );
      return response.data;
    },
    retry: 1,
  });

  const convertUSDtoBillions = (usd: number) => {
    return (usd / 1000000000).toFixed(1);
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onPress={() => navigation.goBack()}>
          <BackIcon source={require("@/assets/images/icons/back.png")} />
        </BackButton>
        <Text>{getCoinQuery.data?.name}</Text>
      </HeaderContainer>
      <PriceContainer>
        <CurrentPriceContainer>
          <CurrentPriceText
            isPositive={
              getCoinQuery.data?.market_data
                ?.price_change_percentage_1h_in_currency > 0
            }
          >
            {getCoinQuery.data?.market_data.current_price?.usd}
          </CurrentPriceText>
          <SubPriceContainer>
            <USDPriceText>
              ≈ ${getCoinQuery.data?.market_data.current_price?.usd}
            </USDPriceText>
            <FluctuationText
              isPositive={
                getCoinQuery.data?.market_data
                  .market_cap_change_percentage_24h > 0
              }
            >
              {getCoinQuery.data?.market_data.market_cap_change_percentage_24h?.toFixed(
                2,
              )}
              %
            </FluctuationText>
          </SubPriceContainer>
        </CurrentPriceContainer>
        <PriceSummaryContainer>
          <SummarySectionContainer>
            <SummarySectionTitle>24 High</SummarySectionTitle>
            <SummarySectionText>
              {getCoinQuery.data?.market_data?.high_24h?.usd}
            </SummarySectionText>
          </SummarySectionContainer>
          <SummarySectionContainer>
            <SummarySectionTitle>
              24h Vol({getCoinQuery.data?.name})
            </SummarySectionTitle>
            <SummarySectionText>
              {convertUSDtoBillions(
                getCoinQuery.data?.market_data?.market_cap?.usd,
              )}
              B
            </SummarySectionText>
          </SummarySectionContainer>
          <SummarySectionContainer>
            <SummarySectionTitle>24h Low</SummarySectionTitle>
            <SummarySectionText>
              {getCoinQuery.data?.market_data?.low_24h?.usd}
            </SummarySectionText>
          </SummarySectionContainer>
          <SummarySectionContainer>
            <SummarySectionTitle>24h Vol(USDT)</SummarySectionTitle>
            <SummarySectionText>
              {convertUSDtoBillions(
                getCoinQuery.data?.market_data?.market_cap?.usd,
              )}
              B
            </SummarySectionText>
          </SummarySectionContainer>
        </PriceSummaryContainer>
      </PriceContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const HeaderContainer = styled.View`
  padding: 0 16px 16px 16px;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  border-bottom-width: 0.5px;
  border-color: #f1f1f1;
`;

const BackButton = styled.Pressable``;

const BackIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const PriceContainer = styled.View`
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
`;

const CurrentPriceText = styled.Text<{ isPositive?: boolean }>`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) =>
    props.isPositive ? Colors.positiveCandleColor : Colors.negativeCandleColor};
`;

const SubPriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const FluctuationText = styled.Text<{ isPositive?: boolean }>`
  font-size: 12px;
  color: ${(props) =>
    props.isPositive ? Colors.positiveCandleColor : Colors.negativeCandleColor};
`;

const USDPriceText = styled.Text`
  font-size: 12px;
`;

const CurrentPriceContainer = styled.View`
  gap: 4px;
  flex: 1.5;
`;

const PriceSummaryContainer = styled.View`
  flex: 1;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SummarySectionContainer = styled.View`
  gap: 4px;
`;

const SummarySectionTitle = styled.Text`
  color: #b1a8a8;
  font-size: 10px;
`;

const SummarySectionText = styled.Text`
  font-size: 12px;
`;

export default CryptoView;
