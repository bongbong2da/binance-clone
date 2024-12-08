import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import HomeCustomHeader from "@/components/HomeCustomHeader";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigation, useRouter } from "expo-router";
import { useRecoilState } from "recoil";
import { tabBarVisibleAtom } from "@/recoil/atoms/UIAtoms";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TickerPrice, TickerPriceChange } from "@/types/binance/types";

type FluctuationType = "positive" | "negative" | "neutral";

interface TickerWithPrice {
  tickerPrice: TickerPrice;
  priceChange: TickerPriceChange;
}

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const router = useRouter();
  const [tabBarVisible, setTabBarVisible] = useRecoilState(tabBarVisibleAtom);
  const [currentPromotionCrypto, setCurrentPromotionCrypto] = useState([]);
  const [
    currentPromotionCryptoPriceChanges,
    setCurrentPromotionCryptoPriceChanges,
  ] = useState<TickerWithPrice[]>([]);

  const getPromotionTickerPrice = useQuery<TickerPrice[]>({
    queryKey: ["getPromotionTickers"],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + "/api/v3/ticker/price",
      );

      setCurrentPromotionCrypto(response.data.slice(0, 10));

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const getPromotionTickerPriceChanges = useQuery<TickerPriceChange[]>({
    queryKey: ["getPromotionTickerPriceChanges", currentPromotionCrypto],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL +
          `/api/v3/ticker/24hr?symbols=[${currentPromotionCrypto.map(
            (coin: TickerPrice) => `"${coin.symbol}"`,
          )}]`,
      );

      const tickersWithPrice: TickerWithPrice[] = response.data.map(
        (priceChange: TickerPriceChange, index: number) => ({
          tickerPrice: currentPromotionCrypto[index],
          priceChange,
        }),
      );

      setCurrentPromotionCryptoPriceChanges(tickersWithPrice);

      return response.data;
    },
    enabled: currentPromotionCrypto.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const convertBTCtoUSD = (btc: string) => {
    const btcToUsd = Number(btc) * 98392.53;
    return btcToUsd.toFixed(5);
  };

  const handlePressCrypto = (symbol: string) => {
    router.navigate(`/(tabs)/(home)/${symbol}`);
  };

  useEffect(() => {
    const onFocus = navigation.addListener("focus", () => {
      setTabBarVisible(true);
    });

    const onBlur = navigation.addListener("blur", () => {
      setTabBarVisible(false);
    });

    return () => {
      onFocus();
      onBlur();
    };
  }, []);

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
          {currentPromotionCryptoPriceChanges.map((ticker, index: number) => {
            return (
              <PromotionCoinButton
                key={index + ticker.tickerPrice.symbol}
                onPress={() => handlePressCrypto(ticker.tickerPrice.symbol)}
              >
                <PromotionCoinTitleContainer>
                  <PromotionCoinTitle>
                    {ticker.tickerPrice.symbol}
                  </PromotionCoinTitle>
                </PromotionCoinTitleContainer>
                <CoinPriceContainer>
                  <Text>{convertBTCtoUSD(ticker.tickerPrice.price)}</Text>
                  <CoinPriceHintText>
                    ${convertBTCtoUSD(ticker.tickerPrice.price)}
                  </CoinPriceHintText>
                </CoinPriceContainer>
                <FluctuationContainer
                  fluctuation={
                    Number(ticker.priceChange.priceChange) > 0
                      ? "positive"
                      : "negative"
                  }
                >
                  <FluctuationText numberOfLines={1}>
                    {Number(ticker.priceChange.priceChangePercent).toFixed(2)}%
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

const CryptoLogoImage = styled.Image`
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
