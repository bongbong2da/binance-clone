import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { useRecoilState } from "recoil";
import { tabBarVisibleAtom } from "@/recoil/atoms/UIAtoms";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GeckoCoinDetail } from "@/types/gecko/types";
import { Colors } from "@/constants/Colors";

const TradesScreen = () => {
  const navigation = useNavigation();
  const { cryptoId } = useLocalSearchParams();
  const router = useRouter();
  const [tabBarVisible, setTabBarVisible] = useRecoilState(tabBarVisibleAtom);

  const [currentCryptoId, setCurrentCryptoId] = useState<string>("bitcoin");

  const getCoinQuery = useQuery<GeckoCoinDetail>({
    queryKey: ["getCoin", currentCryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + `/coins/${currentCryptoId}`,
        {},
      );
      return response.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const renderPriceRow = (
    type: "positive" | "negative",
    items: { price: number; amount: number }[],
  ) => {
    return items.map((item, index) => {
      return (
        <TradePriceRowContainer key={index + item.price} type={type}>
          <TradePriceText type={type}>{item.price}</TradePriceText>
          <TradePriceText type={type}>{item.amount}</TradePriceText>
        </TradePriceRowContainer>
      );
    });
  };

  const generateDummyPrices = (
    type: "positive" | "negative",
    currentPrice: number,
  ) => {
    if (!currentPrice) return [];

    const prices = [];
    const numberOfDigits = currentPrice.toString().length;
    const proportionalNumber = 1 / Math.pow(10, numberOfDigits - 0.1);

    for (let i = 1; i < 7; i++) {
      const additionalPrice = i * currentPrice * proportionalNumber;
      const price =
        type === "positive"
          ? currentPrice + additionalPrice
          : currentPrice - additionalPrice;
      const randomAmount = Math.floor(
        Math.random() * Math.floor(Math.random() * 10000),
      );
      prices.push({ price: Number(price.toFixed(2)), amount: randomAmount });
    }
    return type === "positive" ? prices.reverse() : prices;
  };

  useEffect(() => {
    if (cryptoId && typeof cryptoId === "string") {
      setCurrentCryptoId(cryptoId);
    }
  }, [cryptoId]);

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
      <HeaderContainer>
        <HeaderText>Spot Trade</HeaderText>
      </HeaderContainer>
      <CryptoTitleContainer>
        <CryptoTitleText>
          {getCoinQuery.data?.symbol?.toUpperCase()}USDT
        </CryptoTitleText>
        <CryptoFluctuationText
          isPositive={
            getCoinQuery.data?.market_data?.price_percentage_1h_in_current
              ?.usd > 0
          }
        >
          {getCoinQuery.data?.market_data?.price_change_percentage_1h_in_currency?.usd?.toFixed(
            2,
          )}
          %
        </CryptoFluctuationText>
      </CryptoTitleContainer>
      <ContentContainer>
        <TradePriceContainer>
          <TradPriceHintContainer>
            <TradePriceHintTextContainer direction="left">
              <TradePriceHintText>Price</TradePriceHintText>
              <TradePriceHintText>(USDT)</TradePriceHintText>
            </TradePriceHintTextContainer>
            <TradePriceHintTextContainer direction="right">
              <TradePriceHintText>Amount</TradePriceHintText>
              <TradePriceHintText>(USDT)</TradePriceHintText>
            </TradePriceHintTextContainer>
          </TradPriceHintContainer>
          {renderPriceRow(
            "positive",
            generateDummyPrices(
              "positive",
              getCoinQuery.data?.market_data?.current_price?.usd,
            ),
          )}
          <TradeCurrentPriceContainer>
            <TradeCurrentPriceText status={"positive"}>
              {getCoinQuery.data?.market_data?.current_price?.usd}
            </TradeCurrentPriceText>
          </TradeCurrentPriceContainer>
          {renderPriceRow(
            "negative",
            generateDummyPrices(
              "negative",
              getCoinQuery.data?.market_data?.current_price?.usd,
            ),
          )}
        </TradePriceContainer>
      </ContentContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  padding: 16px;
  border-bottom-width: 0.5px;
  border-color: #e3e3e3;
`;

const HeaderText = styled.Text`
  font-size: 20px;
`;

const CryptoTitleContainer = styled.View`
  padding: 16px 0;
`;

const CryptoTitleText = styled.Text`
  font-size: 24px;
`;

const CryptoFluctuationText = styled.Text<{ isPositive?: boolean }>`
  font-size: 14px;
  color: ${(props) =>
    props.isPositive ? Colors.positiveCandleColor : Colors.negativeCandleColor};
`;

const ContentContainer = styled.View`
  flex: 1;
  flex-direction: row;
`;

const TradePriceContainer = styled.View`
  flex: 1;
`;

const TradPriceHintContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TradePriceHintTextContainer = styled.View<{
  direction?: "left" | "right";
}>`
  flex: 1;
  align-items: ${(props) =>
    props.direction === "left" ? "flex-start" : "flex-end"};
  gap: 2px;
`;

const TradePriceHintText = styled.Text`
  font-size: 12px;
  color: #717171;
`;

const TradePriceRowContainer = styled.Pressable<{
  type: "positive" | "negative";
}>`
  padding: 3px 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TradePriceText = styled.Text<{ type: "positive" | "negative" }>`
  letter-spacing: 0.5px;
  color: ${(props) =>
    props.type === "positive"
      ? Colors.positiveCandleColor
      : props.type === "negative"
        ? Colors.negativeCandleColor
        : "#717171"};
`;

const TradeCurrentPriceContainer = styled.View`
  padding: 16px;
  align-items: center;
  justify-content: center;
`;

const TradeCurrentPriceText = styled.Text<{
  status: "positive" | "neutral" | "negative";
}>`
  font-size: 20px;
  color: ${(props) =>
    props.status === "positive"
      ? Colors.positiveCandleColor
      : props.status === "negative"
        ? Colors.negativeCandleColor
        : "#717171"};
`;

export default TradesScreen;
