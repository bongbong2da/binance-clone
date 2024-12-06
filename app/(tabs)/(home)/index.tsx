import React from "react";
import styled from "styled-components/native";
import HomeCustomHeader from "@/components/HomeCustomHeader";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type FluctuationType = "positive" | "negative" | "neutral";

interface CoinItemInterface {
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

const HomeScreen = () => {
  const getExchangesQuery = useQuery({
    queryKey: ["getTrendingCoins"],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + "/search/trending",
      );
      return response;
    },
    staleTime: 1000 * 60 * 60,
  });

  const convertBTCtoUSD = (btc: string) => {
    const btcToUsd = Number(btc) * 98392.53;
    return btcToUsd.toFixed(5);
  };

  return (
    <Container>
      <HomeCustomHeader />
      <ContentContainer>
        <PromotionContainer
          source={require("@/assets/images/dummy-chart.jpg")}
          imageStyle={{
            opacity: 0.5,
          }}
        >
          <PromotionHeaderText>
            Explore the World of Digital Assets!
          </PromotionHeaderText>
          <PromotionButton>
            <PromotionSignUpText>Sign Up / Log In</PromotionSignUpText>
          </PromotionButton>
        </PromotionContainer>
        <PromotionCoinsContainer>
          {getExchangesQuery.data?.data?.coins?.map(
            (coin: { item: CoinItemInterface }, index: number) => {
              return (
                <PromotionCoinButton key={index + coin.item.id}>
                  <PromotionCoinTitleContainer>
                    <PromotionCoinTitle>{coin.item.name}</PromotionCoinTitle>
                    <FireIcon source={{ url: coin.item.large }} />
                  </PromotionCoinTitleContainer>
                  <CoinPriceContainer>
                    <Text>{convertBTCtoUSD(coin.item.price_btc)}</Text>
                    <CoinPriceHintText>
                      ${convertBTCtoUSD(coin.item.price_btc)}
                    </CoinPriceHintText>
                  </CoinPriceContainer>
                  <FluctuationContainer
                    fluctuation={
                      Number(coin.item.data.price_change_percentage_24h.usd) > 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    <FluctuationText numberOfLines={1}>
                      {coin.item.data.price_change_percentage_24h.usd.toFixed(
                        2,
                      )}
                      %
                    </FluctuationText>
                  </FluctuationContainer>
                </PromotionCoinButton>
              );
            },
          )}
          <ViewMoreButton>
            <ViewMoreText>View 350+ Coins</ViewMoreText>
          </ViewMoreButton>
        </PromotionCoinsContainer>
      </ContentContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const ContentContainer = styled.ScrollView``;

const PromotionContainer = styled.ImageBackground`
  padding: 30px 16px;
  gap: 30px;
`;

const PromotionHeaderText = styled.Text`
  font-size: 24px;
  letter-spacing: 1px;
  font-weight: bold;
`;

const PromotionButton = styled.Pressable`
  padding: 8px 30px;
  background-color: ${Colors.light.secondaryTint};
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
`;

const PromotionSignUpText = styled.Text`
  font-weight: lighter;
  font-size: 14px;
`;

const PromotionCoinsContainer = styled.View`
  padding: 0 16px;
  border-bottom-width: 0.5px;
  border-color: #e8e8e8;
  gap: 12px;
`;

const PromotionCoinButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PromotionCoinTitleContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const PromotionCoinTitle = styled.Text``;

const FireIcon = styled.Image`
  width: 14px;
  height: 14px;
`;

const CoinPriceContainer = styled.View`
  align-items: flex-end;
  gap: 4px;
`;

const CoinPriceHintText = styled.Text`
  font-size: 10px;
  color: #a1a1a1;
`;

const FluctuationContainer = styled.View<{
  fluctuation: FluctuationType;
}>`
  width: 80px;
  background-color: ${({ fluctuation }) =>
    fluctuation === "positive"
      ? Colors.positiveCandleColor
      : fluctuation === "negative"
        ? Colors.negativeCandleColor
        : "#979797"};
  padding: 4px 12px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const FluctuationText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const ViewMoreButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  padding: 16px 0;
`;

const ViewMoreText = styled.Text`
  font-size: 12px;
  color: #cda816;
`;

export default HomeScreen;
