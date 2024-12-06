import React from "react";
import styled from "styled-components/native";
import HomeCustomHeader from "@/components/HomeCustomHeader";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";

type FluctuationType = "positive" | "negative" | "neutral";

interface PromotionCoinInterface {
  title: string;
  isFire?: boolean;
  price: number;
  priceHint: string;
  fluctuation: FluctuationType;
  fluctuationAmount: number;
}

const promotionCoins: PromotionCoinInterface[] = [
  {
    title: "BTC",
    isFire: true,
    price: 45000,
    priceHint: "$45000",
    fluctuation: "negative",
    fluctuationAmount: 0.6,
  },
  {
    title: "ETH",
    isFire: true,
    price: 3000,
    priceHint: "$3000",
    fluctuation: "positive",
    fluctuationAmount: 0.6,
  },
  {
    title: "BNB",
    isFire: true,
    price: 500,
    priceHint: "$500",
    fluctuation: "positive",
    fluctuationAmount: 0.6,
  },
  {
    title: "ADA",
    isFire: true,
    price: 2.5,
    priceHint: "$2.5",
    fluctuation: "neutral",
    fluctuationAmount: 0,
  },
  {
    title: "SOL",
    isFire: true,
    price: 150,
    priceHint: "$150",
    fluctuation: "positive",
    fluctuationAmount: 0.6,
  },
  {
    title: "DOGE",
    isFire: true,
    price: 0.3,
    priceHint: "$0.3",
    fluctuation: "positive",
    fluctuationAmount: 0.6,
  },
];

const HomeScreen = () => {
  const getFluctuationSymbol = (fluctuation: FluctuationType) => {
    if (fluctuation === "positive") {
      return "+";
    } else if (fluctuation === "negative") {
      return "-";
    } else {
      return "";
    }
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
          {promotionCoins.map((coin, index) => {
            return (
              <PromotionCoinButton>
                <PromotionCoinTitleContainer>
                  <PromotionCoinTitle>{coin.title}</PromotionCoinTitle>
                  <FireIcon
                    source={require("@/assets/images/icons/fire.png")}
                  />
                </PromotionCoinTitleContainer>
                <CoinPriceContainer>
                  <Text>{coin.price}</Text>
                  <CoinPriceHintText>{coin.priceHint}</CoinPriceHintText>
                </CoinPriceContainer>
                <FluctuationContainer fluctuation={coin.fluctuation}>
                  <FluctuationText>
                    {getFluctuationSymbol(coin.fluctuation)}
                    {coin.fluctuationAmount}%
                  </FluctuationText>
                </FluctuationContainer>
              </PromotionCoinButton>
            );
          })}
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

const ContentContainer = styled.View``;

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
  tint-color: ${Colors.light.secondaryTint};
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
  width: 70px;
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
  align-self: flex-start;
  gap: 4px;
`;

const FluctuationText = styled.Text`
  color: white;
  font-size: 12px;
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
