import React, { useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components/native";
import { Dimensions, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { LineChart } from "react-native-wagmi-charts";
import { GeckoCoinDetail } from "@/types/gecko/types";

const CryptoViewScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { cryptoId } = useLocalSearchParams();

  const [currentChartInterval, setCurrentChartInterval] = useState<number>(1);
  const [currentPriceChart, setCurrentPriceChart] = useState<any[]>([]);
  const [currentVolumeChart, setCurrentVolumeChart] = useState<any[]>([]);

  const getCoinQuery = useQuery<GeckoCoinDetail>({
    queryKey: ["getCoin", cryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + `/coins/${cryptoId}`,
        {},
      );
      return response.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const getCoinChartQuery = useQuery({
    queryKey: ["getCryptoChart", cryptoId, currentChartInterval],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL +
          `/coins/${cryptoId}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days: currentChartInterval,
          },
          headers: {
            "Accept-Encoding": "gzip",
            Authorization: "Bearer " + process.env.EXPO_PUBLIC_COINCAP_API_KEY,
          },
        },
      );

      setCurrentPriceChart(convertToChartValue(response.data.prices));
      setCurrentVolumeChart(convertToChartValue(response.data.total_volumes));

      return response.data.prices;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const convertUSDtoBillions = (usd: number) => {
    if (usd > 1000000000) {
      return (usd / 1000000000).toFixed(2);
    } else if (usd > 1000000) {
      return (usd / 1000000).toFixed(2);
    } else {
      return usd;
    }
  };

  const convertToChartValue = (prices: number[][]) => {
    if (!prices) return [];
    return prices.map((price) => ({
      timestamp: price[0],
      value: price[1],
    }));
  };

  const handlePressInterval = (interval: "1d" | "1w" | "1m" | "6m" | "1y") => {
    switch (interval) {
      case "1d":
        setCurrentChartInterval(1);
        break;
      case "1w":
        setCurrentChartInterval(7);
        break;
      case "6m":
        setCurrentChartInterval(180);
        break;
      case "1m":
        setCurrentChartInterval(30);
        break;
      case "1y":
        setCurrentChartInterval(365);
        break;
      default:
        setCurrentChartInterval(1);
    }
  };

  const handlePressTrade = () => {
    router.navigate("/(tabs)/(trades)");
  };

  return (
    <Container>
      <HeaderContainer>
        <BackButton onPress={() => router.back()}>
          <BackIcon source={require("@/assets/images/icons/back.png")} />
        </BackButton>
        <TitleContainer>
          <CryptoLogoImage source={{ uri: getCoinQuery.data?.image.thumb }} />
          <Text>{getCoinQuery.data?.name}</Text>
        </TitleContainer>
      </HeaderContainer>
      <ContentContainer>
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
        <IntervalSelectContainer>
          <IntervalButton onPress={() => handlePressInterval("1d")}>
            <IntervalButtonText isSelected={currentChartInterval === 1}>
              1D
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1w")}>
            <IntervalButtonText isSelected={currentChartInterval === 7}>
              1W
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1m")}>
            <IntervalButtonText isSelected={currentChartInterval === 30}>
              1M
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("6m")}>
            <IntervalButtonText isSelected={currentChartInterval === 180}>
              6M
            </IntervalButtonText>
          </IntervalButton>
          <IntervalButton onPress={() => handlePressInterval("1y")}>
            <IntervalButtonText isSelected={currentChartInterval === 365}>
              1Y
            </IntervalButtonText>
          </IntervalButton>
        </IntervalSelectContainer>
        {currentPriceChart.length !== 0 && (
          <LineChart.Provider data={currentPriceChart}>
            <LineChart height={Dimensions.get("window").height * 0.4}>
              <LineChart.Path color={Colors.light.tint} width={1}>
                <LineChart.Gradient color={Colors.light.secondaryTint} />
                <LineChart.HorizontalLine
                  at={{
                    value: getCoinQuery.data?.market_data.current_price?.usd,
                  }}
                />
              </LineChart.Path>
              <LineChart.CursorCrosshair>
                <LineChart.Tooltip
                  style={{
                    paddingHorizontal: 6,
                    backgroundColor: "#e8e8e8",
                    borderRadius: 6,
                    alignSelf: "flex-start",
                  }}
                  textStyle={{
                    fontSize: 12,
                  }}
                />
                <LineChart.Tooltip position="bottom">
                  <LineChart.DatetimeText />
                </LineChart.Tooltip>
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
        )}

        {currentVolumeChart.length !== 0 && (
          <LineChart.Provider data={currentVolumeChart}>
            <LineChart
              style={{
                borderBottomWidth: 1,
                borderColor: "#a1a1a1",
              }}
              height={Dimensions.get("window").height * 0.1}
            >
              <LineChart.Path color={"#a1a1a1"} width={1}>
                <LineChart.Gradient color={"#a1a1a1"} />
              </LineChart.Path>
              <LineChart.CursorCrosshair>
                <LineChart.Tooltip
                  style={{
                    paddingHorizontal: 6,
                    backgroundColor: "#e8e8e8",
                    borderRadius: 6,
                    alignSelf: "flex-start",
                  }}
                  textStyle={{
                    fontSize: 12,
                  }}
                />
                <LineChart.Tooltip position="bottom">
                  <LineChart.DatetimeText />
                </LineChart.Tooltip>
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
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

export default CryptoViewScreen;
