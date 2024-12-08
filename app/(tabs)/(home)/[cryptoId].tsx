import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components/native";
import { Dimensions, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { CandlestickChart } from "react-native-wagmi-charts";
import {
  ExchangeInfo,
  TickerPrice,
  TickerPriceChange,
} from "@/types/binance/types";
import { useRecoilState } from "recoil";
import { standardCurrencyAtom } from "@/recoil/atoms/CurrencyAtoms";

type ChartInterval = "1s" | "1d" | "1w" | "1m" | "3m" | "5m" | "1M";

const CryptoDetail = () => {
  const router = useRouter();
  const { cryptoId } = useLocalSearchParams();

  const [standardCurrency, setStandardCurrency] =
    useRecoilState(standardCurrencyAtom);

  const [standardTimestamp, setStandardTimestamp] = useState<number>(
    new Date().getTime(),
  );
  const [currentExchangeInfo, setCurrentExchangeInfo] =
    useState<ExchangeInfo>();
  const [currentTickerPrice, setCurrentTickerPrice] = useState<TickerPrice>();
  const [currentTickerPriceChange, setCurrentTickerPriceChange] =
    useState<TickerPriceChange>();
  const [currentTickerSymbol, setCurrentTickerSymbol] = useState<string>("");

  const [currentChartInterval, setCurrentChartInterval] =
    useState<ChartInterval>("1s");
  const [currentPriceChart, setCurrentPriceChart] = useState<any[]>([]);
  const [currentVolumeChart, setCurrentVolumeChart] = useState<any[]>([]);

  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [fluctuationStatus, setFluctuationStatus] = useState<
    "positive" | "neutral" | "negative"
  >("neutral");

  const getExchangeInfo = useQuery<ExchangeInfo>({
    queryKey: ["getExchangeInfo", cryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/exchangeInfo`,
        {
          params: {
            symbol: cryptoId,
          },
        },
      );

      setCurrentExchangeInfo(response.data);
      setCurrentTickerSymbol(response.data.symbols[0].symbol);

      return response.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const getIntervalStartTime = (interval: ChartInterval) => {
    let startTimeAdjustment = 0;

    if (interval === "1s") {
      startTimeAdjustment = 1000 * 60;
    } else if (interval === "1m") {
      startTimeAdjustment = 1000 * 60 * 60;
    } else if (interval === "5m") {
      startTimeAdjustment = 1000 * 60 * 60 * 4;
    } else if (interval === "1M") {
      startTimeAdjustment = 1000 * 60 * 60 * 24 * 7;
    } else if (interval === "1w") {
      startTimeAdjustment = 1000 * 60 * 60 * 24 * 30 * 6;
    } else if (interval === "1d") {
      startTimeAdjustment = 1000 * 60 * 60 * 24 * 30 * 3;
    }

    const currentTime = new Date().getTime();

    return currentTime - startTimeAdjustment;
  };

  const getRefetchInterval = (interval: ChartInterval) => {
    if (interval === "1s") {
      return 1000;
    } else if (interval === "1m") {
      return 1000 * 60;
    } else {
      return false;
    }
  };

  const getKlineCandleSticks = useQuery({
    queryKey: ["getKlineCandleSticks", cryptoId, currentChartInterval],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/klines`,
        {
          params: {
            startTime: getIntervalStartTime(currentChartInterval),
            symbol: cryptoId,
            interval: currentChartInterval,
          },
        },
      );

      setCurrentPriceChart(convertToChartValue(response.data));
      setCurrentVolumeChart(convertToChartValue(response.data));

      return response.data;
    },
    retry: 1,
    staleTime: 0,
    refetchInterval: getRefetchInterval(currentChartInterval),
  });

  const getTickerPrice = useQuery({
    queryKey: ["getTickerPrice", cryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/ticker/price`,
        {
          params: {
            symbol: cryptoId,
          },
        },
      );

      if (Number(response.data.price) > previousPrice) {
        setFluctuationStatus("positive");
      } else if (Number(response.data.price) < previousPrice) {
        setFluctuationStatus("negative");
      } else {
        setFluctuationStatus("neutral");
      }
      setPreviousPrice(Number(response.data.price));

      setCurrentTickerPrice(response.data);

      return response.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000,
  });

  const getTickerPriceChange = useQuery({
    queryKey: ["getTickerPriceChange", cryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/ticker/24hr`,
        {
          params: {
            symbol: cryptoId,
          },
        },
      );

      setCurrentTickerPriceChange(response.data);

      return response.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const convertUSDtoBillions = (usd: number) => {
    if (usd > 10000) {
      return (usd / 10000).toFixed(2);
    } else if (usd > 10000) {
      return (usd / 10000).toFixed(2);
    } else {
      return usd;
    }
  };

  const convertToChartValue = (prices: number[][]) => {
    if (!prices) return [];
    return prices.map((price) => ({
      timestamp: price[0],
      open: price[1],
      high: price[2],
      low: price[3],
      close: price[4],
    }));
  };

  const handlePressInterval = (interval: ChartInterval) => {
    setCurrentChartInterval(interval);
  };

  const handlePressTrade = () => {
    router.navigate(
      `/(tabs)/(trades)/${currentExchangeInfo?.symbols?.[0]?.symbol}`,
    );
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onPress={() => router.back()}>
          <BackIcon source={require("@/assets/images/icons/back.png")} />
        </BackButton>
        <TitleContainer>
          <Text>{currentTickerSymbol}</Text>
        </TitleContainer>
      </HeaderContainer>
      <ContentContainer>
        <PriceContainer>
          <CurrentPriceContainer>
            <CurrentPriceText fluctuationStatus={fluctuationStatus}>
              {Number(currentTickerPrice?.price)?.toFixed(4)}
            </CurrentPriceText>
            <SubPriceContainer>
              <USDPriceText>
                ≈ ${Number(currentTickerPrice?.price)?.toFixed(2)}
              </USDPriceText>
              <FluctuationText
                isPositive={
                  Number(currentTickerPriceChange?.priceChangePercent) > 0
                }
              >
                {Number(currentTickerPriceChange?.priceChangePercent).toFixed(
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
                {Number(currentTickerPriceChange?.highPrice).toFixed()}
              </SummarySectionText>
            </SummarySectionContainer>
            <SummarySectionContainer>
              <SummarySectionTitle>
                24h Vol({currentExchangeInfo?.symbols[0].baseAsset})
              </SummarySectionTitle>
              <SummarySectionText>
                {Number(currentTickerPriceChange?.volume).toFixed(2)}
              </SummarySectionText>
            </SummarySectionContainer>
            <SummarySectionContainer>
              <SummarySectionTitle>24h Low</SummarySectionTitle>
              <SummarySectionText>
                {Number(currentTickerPriceChange?.lowPrice).toFixed()}
              </SummarySectionText>
            </SummarySectionContainer>
            <SummarySectionContainer>
              <SummarySectionTitle>
                24h Vol({currentExchangeInfo?.symbols[0].quoteAsset})
              </SummarySectionTitle>
              <SummarySectionText>
                {convertUSDtoBillions(Number(currentTickerPriceChange?.volume))}
                B
              </SummarySectionText>
            </SummarySectionContainer>
          </PriceSummaryContainer>
        </PriceContainer>
        <IntervalSelectContainer>
          <IntervalButton onPress={() => handlePressInterval("1s")}>
            <IntervalButtonText isSelected={currentChartInterval === "1s"}>
              1s
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1d")}>
            <IntervalButtonText isSelected={currentChartInterval === "1d"}>
              1D
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1w")}>
            <IntervalButtonText isSelected={currentChartInterval === "1w"}>
              1W
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1m")}>
            <IntervalButtonText isSelected={currentChartInterval === "1m"}>
              1m
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("5m")}>
            <IntervalButtonText isSelected={currentChartInterval === "5m"}>
              5m
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1M")}>
            <IntervalButtonText isSelected={currentChartInterval === "1M"}>
              1M
            </IntervalButtonText>
          </IntervalButton>
        </IntervalSelectContainer>
        {currentPriceChart.length !== 0 && (
          <CandlestickChart.Provider data={currentPriceChart}>
            <CandlestickChart height={Dimensions.get("window").height * 0.3}>
              <CandlestickChart.Candles useAnimations={false} />
              <CandlestickChart.Crosshair>
                <CandlestickChart.Tooltip />
              </CandlestickChart.Crosshair>
            </CandlestickChart>
            <CandlestickChart.PriceText />
            <CandlestickChart.DatetimeText />
          </CandlestickChart.Provider>
        )}
        <OptionButtonContainer>
          <OptionButton type="buy" onPress={handlePressTrade}>
            <OptionButtonText>Buy</OptionButtonText>
          </OptionButton>
          <OptionButton type="sell" onPress={handlePressTrade}>
            <OptionButtonText>Sell</OptionButtonText>
          </OptionButton>
        </OptionButtonContainer>
      </ContentContainer>
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

const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CryptoLogoImage = styled.Image`
  width: 16px;
  height: 16px;
`;

const BackButton = styled.Pressable``;

const BackIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
`;

const PriceContainer = styled.View`
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
`;

const CurrentPriceText = styled.Text<{
  fluctuationStatus: "positive" | "neutral" | "negative";
}>`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) =>
    props.fluctuationStatus === "positive"
      ? Colors.positiveCandleColor
      : props.fluctuationStatus === "negative"
        ? Colors.negativeCandleColor
        : "black"};
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

const IntervalSelectContainer = styled.View`
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const IntervalButton = styled.Pressable`
  padding: 4px 8px;
  align-items: center;
  justify-content: center;
`;

const IntervalButtonText = styled.Text<{ isSelected?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.isSelected ? "black" : "#b1a8a8")};
`;

const OptionButtonContainer = styled.View`
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
`;

const OptionButton = styled.Pressable<{ type: "buy" | "sell" }>`
  flex: 1;
  padding: 12px;
  background-color: ${({ type }) =>
    type === "buy" ? Colors.positiveCandleColor : Colors.negativeCandleColor};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;
const OptionButtonText = styled.Text`
  color: white;
  font-weight: bold;
  letter-spacing: 0.6;
`;

export default CryptoDetail;
