import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components/native";
import { useRecoilState } from "recoil";
import { tabBarVisibleAtom } from "@/recoil/atoms/UIAtoms";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Colors } from "@/constants/Colors";
import { Dimensions, Text } from "react-native";
import { css } from "styled-components";
import { Slider } from "@miblanchard/react-native-slider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  ExchangeInfo,
  TickerPrice,
  TickerPriceChange,
} from "@/types/binance/types";

type TradeMode = "Buy" | "Sell";
type TradeType = "Market" | "Limit";

interface OrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface OrderInterface {
  ticker: TickerPrice;
  amount: number;
  tradeMode: TradeMode;
  tradeType: TradeType;
  createdAt: Date;
}

interface TradePriceItem {
  price: number;
  amount: number;
}

const TradesScreen = () => {
  const navigation = useNavigation();
  const { cryptoId } = useLocalSearchParams();
  const router = useRouter();

  const [tabBarVisible, setTabBarVisible] = useRecoilState(tabBarVisibleAtom);

  const isTargetPriceInitialized = useRef<boolean>(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [dummyPositivePrices, setDummyPositivePrices] = useState<
    TradePriceItem[]
  >([]);
  const [dummyNegativePrices, setDummyNegativePrices] = useState<
    TradePriceItem[]
  >([]);

  const [currentExchangeInfo, setCurrentExchangeInfo] =
    useState<ExchangeInfo>();
  const [currentCryptoSymbol, setCurrentCryptoSymbol] = useState<string>("BTC");
  const [currentCryptoMarketPrice, setCurrentCryptoMarketPrice] =
    useState<number>(0);
  const [currentDayTickerPriceChange, setCurrentDayTickerPriceChange] =
    useState<TickerPriceChange>();
  const [avblUSDT, setAvblUSDT] = useState(500);
  const [avblCrypto, setAvblCrypto] = useState(0.1);
  const [currentCryptoId, setCurrentCryptoId] = useState<string>("BTCUSDT");
  const [currentTradeMode, setCurrentTradeMode] = useState<TradeMode>("Buy");
  const [currentTradeType, setCurrentTradeType] = useState<TradeType>("Market");
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [currencyAmount, setCurrencyAmount] = useState<string>("");
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [slideValue, setSlideValue] = useState<number>(0);

  const [orderList, setOrderList] = useState<OrderInterface[]>([]);

  const getExchangeInfo = useQuery<ExchangeInfo>({
    queryKey: ["getExchangeInfo", currentCryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/exchangeInfo`,
        {
          params: {
            symbol: currentCryptoId,
          },
        },
      );

      setCurrentExchangeInfo(response.data);

      if (response.data?.symbols?.[0]) {
        setCurrentCryptoSymbol(response.data?.symbols?.[0]?.symbol);
      }

      return response.data;
    },
    retry: 1,
    refetchInterval: 2000,
  });

  const getTickerPriceQuery = useQuery<TickerPrice>({
    queryKey: ["getTickerPriceQuery", currentCryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/ticker/price`,
        {
          params: {
            symbol: currentCryptoId,
          },
        },
      );

      if (!isTargetPriceInitialized.current) {
        setTargetPrice(response.data.price);
        isTargetPriceInitialized.current = true;
      }

      setCurrentCryptoMarketPrice(response.data.price);

      return response.data;
    },
    retry: 1,
    refetchInterval: 1000,
  });

  const getOrderBooksQuery = useQuery<OrderBook>({
    queryKey: ["getOrderBooks", currentCryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/depth`,
        {
          params: {
            symbol: currentCryptoId,
          },
        },
      );

      generateOrderBook(response.data);

      return response.data;
    },
    retry: 1,
    refetchInterval: 1000,
    enabled: currentCryptoSymbol !== "",
  });

  const getDayTickerPriceChange = useQuery<TickerPriceChange>({
    queryKey: ["getDayTickerPriceChange", currentCryptoId],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL + `/api/v3/ticker/24hr`,
        {
          params: {
            symbol: currentCryptoSymbol,
          },
        },
      );

      setCurrentDayTickerPriceChange(response.data);

      return response.data;
    },
    retry: 1,
    staleTime: 1000,
  });

  const handlePressPriceRow = (
    type: "positive" | "negative",
    price: number,
  ) => {
    if (type === "positive") {
      setCurrentTradeMode("Buy");
    } else {
      setCurrentTradeMode("Sell");
    }
    setCurrentTradeType("Limit");
    setTargetPrice(price);
  };

  const renderPriceRow = (
    type: "positive" | "negative",
    items: { price: number; amount: number }[],
  ) => {
    return items.map((item, index) => {
      const priceString = String(item.price);
      const priceEightDigit = `${priceString.slice(0, 8)}..`;

      const amountString = String(item.amount);
      const amountFourDigit = `${amountString.slice(0, 4)}`;

      return (
        <TradePriceRowContainer
          key={`${index}-${item.price}`}
          type={type}
          onPress={() => handlePressPriceRow(type, item.price)}
        >
          <TradePriceText type={type}>{priceEightDigit}</TradePriceText>
          <TradePriceText type={type}>{amountFourDigit}</TradePriceText>
        </TradePriceRowContainer>
      );
    });
  };

  const generateOrderBook = (orderBook: OrderBook) => {
    const targetAsks = orderBook.asks.slice(0, 5);
    const targetBids = orderBook.bids.slice(0, 5);

    const positivePrices: TradePriceItem[] = [];
    const negativePrices: TradePriceItem[] = [];

    targetBids.forEach((bid) => {
      const price = Number(bid[0]);
      const amount = Number(bid[1]);
      negativePrices.push({ price, amount });
    });

    targetAsks.forEach((ask) => {
      const price = Number(ask[0]);
      const amount = Number(ask[1]);
      positivePrices.push({ price, amount });
    });

    setDummyPositivePrices(positivePrices.reverse());
    setDummyNegativePrices(negativePrices);
  };

  const handlePressTradeMode = (mode: TradeMode) => {
    setCurrentTradeMode(mode);
    setCurrencyAmount("");
    setSlideValue(0);
  };

  const handlePressTradeTypeSelect = () => {
    bottomSheetModalRef.current?.present();
  };

  const calculateMaxBuy = () => {
    if (currentTradeMode === "Buy") {
      const maxValue = avblUSDT / currentCryptoMarketPrice;

      return maxValue.toFixed(4);
    } else {
      return 0;
    }
  };

  const handleChangeSlideValue = (value: number[]) => {
    const percentage = value[0];
    setSlideValue(percentage);
    let amount = 0;
    if (currentTradeMode === "Buy") {
      amount = avblUSDT * (percentage / 100);
    } else {
      amount = avblCrypto * (percentage / 100);
    }
    setCurrencyAmount(amount.toFixed(4));
  };

  const handleConfirmOrder = () => {
    setCurrencyAmount("");
    setSlideValue(0);

    if (currentTradeMode === "Buy") {
      setAvblUSDT(avblUSDT - Number(currencyAmount));
      setAvblCrypto(avblCrypto + Number(currencyAmount) / targetPrice);
    } else {
      setAvblUSDT(avblUSDT + Number(currencyAmount) * targetPrice);
      setAvblCrypto(avblCrypto - Number(currencyAmount));
    }

    const order: OrderInterface = {
      ticker: {
        symbol: currentCryptoSymbol,
        price: targetPrice.toString(),
      },
      amount: Number(currencyAmount),
      tradeMode: currentTradeMode,
      tradeType: currentTradeType,
      createdAt: new Date(),
    };

    setOrderList([...orderList, order]);
  };

  const handlePressTradeType = (type: TradeType) => {
    setCurrentTradeType(type);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleCancelOrder = (order: OrderInterface) => {
    const newOrderList = orderList.filter((item) => item !== order);

    if (order.tradeMode === "Buy") {
      setAvblUSDT(avblUSDT + order.amount);
    } else {
      setAvblCrypto(avblCrypto + order.amount);
    }

    setOrderList(newOrderList);
  };

  const handleCancelAllOrders = () => {
    let currentAvblUSDT = avblUSDT;
    let currentAvblCrypto = avblCrypto;

    orderList.forEach((order) => {
      if (order.tradeMode === "Buy") {
        currentAvblUSDT += order.amount;
      } else {
        currentAvblCrypto += order.amount;
      }
    });

    setAvblUSDT(currentAvblUSDT);
    setAvblCrypto(currentAvblCrypto);

    setOrderList([]);
  };

  const calculateIsPositive = (priceChangePercent?: string) => {
    if (!priceChangePercent) return false;
    const number = Number(priceChangePercent);
    if (isNaN(number)) return false;
    return number > 0;
  };

  const renderOrderItem = (order: OrderInterface, index: number) => {
    return (
      <OrderRowContainer key={index + order.createdAt.toLocaleDateString()}>
        <OrderRowHeaderContainer>
          <OrderHeaderLeftContainer>
            <OrderSymbolText>{order.ticker.symbol}</OrderSymbolText>
            <OrderTypeModeContainer>
              <OrderTypeModeText tradeMode={order.tradeMode}>
                {order.tradeType} / {order.tradeMode}
              </OrderTypeModeText>
              <OrderDateText>
                {order.createdAt.toLocaleDateString()}
              </OrderDateText>
            </OrderTypeModeContainer>
          </OrderHeaderLeftContainer>
          <OrderHeaderRightContainer>
            <CancelButton onPress={() => handleCancelOrder(order)}>
              <Text>Cancel</Text>
            </CancelButton>
          </OrderHeaderRightContainer>
        </OrderRowHeaderContainer>
        <OrderFooterContainer>
          <OrderFooterRow>
            <OrderFooterLabel>Filed / Amount</OrderFooterLabel>
            <OrderFooterValueText>0 / {order.amount}</OrderFooterValueText>
          </OrderFooterRow>
          <OrderFooterRow>
            <OrderFooterLabel>Price</OrderFooterLabel>
            <OrderFooterValueText>{order.ticker.price}</OrderFooterValueText>
          </OrderFooterRow>
        </OrderFooterContainer>
      </OrderRowContainer>
    );
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
      <ScrollWrapper>
        <CryptoHeaderContainer>
          <CryptoTitleContainer
            onPress={() => {
              router.navigate(`/(tabs)/(home)/crypto-search`);
            }}
          >
            <CryptoTitleText>{currentCryptoSymbol}</CryptoTitleText>
            <DownArrowIcon source={require("@/assets/images/icons/down.png")} />
          </CryptoTitleContainer>
          <CryptoFluctuationText
            isPositive={calculateIsPositive(
              currentDayTickerPriceChange?.priceChangePercent,
            )}
          >
            {currentDayTickerPriceChange?.priceChangePercent}%
          </CryptoFluctuationText>
        </CryptoHeaderContainer>
        <ContentContainer>
          <TradePriceContainer>
            <TradPriceHintContainer>
              <TradePriceHintTextContainer direction="left">
                <TradePriceHintText>Price</TradePriceHintText>
                <TradePriceHintText>
                  ({currentExchangeInfo?.symbols?.[0]?.baseAsset})
                </TradePriceHintText>
              </TradePriceHintTextContainer>
              <TradePriceHintTextContainer direction="right">
                <TradePriceHintText>Amount</TradePriceHintText>
                <TradePriceHintText>
                  ({currentExchangeInfo?.symbols?.[0]?.quoteAsset})
                </TradePriceHintText>
              </TradePriceHintTextContainer>
            </TradPriceHintContainer>
            {renderPriceRow("positive", dummyPositivePrices)}
            <TradeCurrentPriceContainer>
              <TradeCurrentPriceText status={"positive"}>
                {Number(currentCryptoMarketPrice).toFixed(4)}
              </TradeCurrentPriceText>
            </TradeCurrentPriceContainer>
            {renderPriceRow("negative", dummyNegativePrices)}
          </TradePriceContainer>
          <OrderContainer>
            <TradeModeSelectContainer>
              <TradeModeButton
                onPress={() => handlePressTradeMode("Buy")}
                type="Buy"
                isSelected={currentTradeMode === "Buy"}
              >
                <TradeModeButtonText isSelected={currentTradeMode === "Buy"}>
                  Buy
                </TradeModeButtonText>
              </TradeModeButton>
              <TradeModeButton
                onPress={() => handlePressTradeMode("Sell")}
                type="Sell"
                isSelected={currentTradeMode === "Sell"}
              >
                <TradeModeButtonText isSelected={currentTradeMode === "Sell"}>
                  Sell
                </TradeModeButtonText>
              </TradeModeButton>
            </TradeModeSelectContainer>
            <TradeTypeSelectButton onPress={handlePressTradeTypeSelect}>
              <Text>{currentTradeType}</Text>
              <DownIcon source={require("@/assets/images/icons/down.png")} />
            </TradeTypeSelectButton>
            <TargetPriceContainer>
              <TargetPriceTextInput
                currentTradeType={currentTradeType}
                editable={currentTradeType !== "Market"}
                value={
                  currentTradeType === "Market"
                    ? "Market Price"
                    : String(targetPrice)
                }
                onChangeText={(text) => setTargetPrice(Number(text))}
                keyboardType="number-pad"
              />
            </TargetPriceContainer>
            <CurrencyAmountContainer>
              <CurrencyAmountTextInput
                value={currencyAmount}
                onChangeText={(text) => setCurrencyAmount(text)}
                placeholder="Total"
                keyboardType="number-pad"
                textAlign={"center"}
              />
              <CurrencyStandardContainer>
                <CurrencyStandardText>
                  {currentTradeMode === "Buy"
                    ? currentExchangeInfo?.symbols?.[0]?.quoteAsset
                    : currentCryptoSymbol}
                </CurrencyStandardText>
              </CurrencyStandardContainer>
            </CurrencyAmountContainer>
            <Slider
              value={slideValue}
              onValueChange={handleChangeSlideValue}
              maximumValue={100}
              renderThumbComponent={() => (
                <ThumbImage
                  source={require("@/assets/images/icons/rhombus.png")}
                />
              )}
              renderAboveThumbComponent={(index, value) => {
                if (isSliding) {
                  return (
                    <CurrencySliderAmountContainer>
                      <CurrencySliderAmountText>
                        {value.toFixed()}%
                      </CurrencySliderAmountText>
                    </CurrencySliderAmountContainer>
                  );
                }
              }}
              maximumTrackTintColor={"#ededed"}
              minimumTrackTintColor={"#9f9f9f"}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
            />
            <CurrencyHintContainer>
              <CurrencyHintRow>
                <CurrencyHintLabel>Avbl</CurrencyHintLabel>
                <CurrencyHintValueText>
                  {currentTradeMode === "Buy"
                    ? avblUSDT.toFixed(2)
                    : avblCrypto.toFixed(2)}{" "}
                  {currentTradeMode === "Buy"
                    ? currentExchangeInfo?.symbols?.[0]?.quoteAsset
                    : currentCryptoSymbol}
                </CurrencyHintValueText>
              </CurrencyHintRow>
              <CurrencyHintRow>
                <CurrencyHintLabel>Max {currentTradeMode}</CurrencyHintLabel>
                <CurrencyHintValueText>
                  {calculateMaxBuy()}{" "}
                  {currentExchangeInfo?.symbols?.[0]?.baseAsset}
                </CurrencyHintValueText>
              </CurrencyHintRow>
              <CurrencyHintRow>
                <CurrencyHintLabel>Fee</CurrencyHintLabel>
                <CurrencyHintValueText>0.1%</CurrencyHintValueText>
              </CurrencyHintRow>
            </CurrencyHintContainer>
            <ActionButtonContainer>
              <OrderButton
                onPress={handleConfirmOrder}
                tradeMode={currentTradeMode}
              >
                <OrderButtonText>
                  {currentTradeMode}{" "}
                  {currentExchangeInfo?.symbols?.[0]?.baseAsset}
                </OrderButtonText>
              </OrderButton>
            </ActionButtonContainer>
          </OrderContainer>
        </ContentContainer>
        <OrderListContainer>
          <OrderListTitleContainer>
            <OrderListTitleText>Open Orders</OrderListTitleText>
            <CancelButton onPress={handleCancelAllOrders}>
              <Text>Cancel All</Text>
            </CancelButton>
          </OrderListTitleContainer>
          <OrderListScrollView>
            {orderList.map((order, index) => {
              return renderOrderItem(order, index);
            })}
            {orderList.length === 0 && (
              <OrderEmptyContainer>
                <Text>No Orders</Text>
              </OrderEmptyContainer>
            )}
          </OrderListScrollView>
        </OrderListContainer>
      </ScrollWrapper>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backdropComponent={(props) => {
          return (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.4}
            />
          );
        }}
      >
        <BottomSheetViewContainer>
          <TradeTypeButton onPress={() => handlePressTradeType("Market")}>
            <TradeTypeButtonText>Market</TradeTypeButtonText>
          </TradeTypeButton>
          <TradeTypeButton onPress={() => handlePressTradeType("Limit")}>
            <TradeTypeButtonText>Limit</TradeTypeButtonText>
          </TradeTypeButton>
        </BottomSheetViewContainer>
      </BottomSheetModal>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const ScrollWrapper = styled.ScrollView`
  flex: 1;
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

const CryptoHeaderContainer = styled.View`
  padding: 16px 8px;
`;

const CryptoTitleContainer = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CryptoLogoImage = styled.Image`
  width: 20px;
  height: 20px;
`;

const CryptoTitleText = styled.Text`
  font-size: 24px;
`;

const DownArrowIcon = styled.Image`
  width: 12px;
  height: 12px;
`;

const CryptoFluctuationText = styled.Text<{ isPositive?: boolean }>`
  font-size: 14px;
  color: ${(props) =>
    props.isPositive ? Colors.positiveCandleColor : Colors.negativeCandleColor};
`;

const ContentContainer = styled.View`
  flex-direction: row;
  gap: 16px;
  padding: 0 8px;
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
  font-size: 10px;
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

const TradePriceText = styled.Text<{
  type: "positive" | "negative";
}>`
  font-size: 14px;
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

const OrderContainer = styled.View`
  flex: 1.5;
  gap: 8px;
`;

const TradeModeSelectContainer = styled.View`
  height: 24px;
  flex-direction: row;
  border-radius: 8px;
  background-color: #ededed;
`;

const TradeModeButton = styled.Pressable<{
  type: "Buy" | "Sell";
  isSelected?: boolean;
}>`
  flex: 1;
  align-items: center;
  justify-content: center;
  ${(props) =>
    props.type === "Buy" &&
    css`
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    `}
  ${(props) =>
    props.type === "Sell" &&
    css`
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    `}
  background-color: ${(props) => {
    if (props.isSelected) {
      return props.type === "Buy"
        ? Colors.positiveCandleColor
        : Colors.negativeCandleColor;
    } else {
      return "transparent";
    }
  }};
`;

const TradeModeButtonText = styled.Text<{ isSelected?: boolean }>`
  color: ${(props) => (props.isSelected ? "white" : "#717171")};
`;

const TradeTypeSelectButton = styled.Pressable`
  width: 100%;
  padding: 8px;
  background-color: #ededed;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const DownIcon = styled.Image`
  position: absolute;
  right: 8px;
  width: 12px;
  height: 12px;
  tint-color: #958a8a;
`;

const TargetPriceContainer = styled.View`
  min-height: 40px;
  background-color: #e7edf4;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px;
`;

const TargetPriceTextInput = styled.TextInput<{ currentTradeType: TradeType }>`
  flex: 1;
  color: ${(props) =>
    props.currentTradeType === "Market" ? "#a6a6a6" : "black"};
`;

const CurrencyAmountContainer = styled.View`
  height: 40px;
  padding: 0 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #ededed;
  border-radius: 8px;
`;

const CurrencyAmountTextInput = styled.TextInput`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
`;

const CurrencyStandardContainer = styled.View`
  padding: 4px 8px;
  border-left-width: 0.5px;
  border-color: #cacaca;
`;

const CurrencyStandardText = styled.Text`
  font-size: 12px;
`;

const ThumbImage = styled.Image`
  width: 20px;
  height: 20px;
`;

const MarkerImage = styled.Image`
  width: 8px;
  height: 8px;
  tint-color: #a3a3a3;
`;

const CurrencySliderAmountContainer = styled.View`
  padding: 2px 4px;
  align-items: center;
  justify-content: center;
  background-color: #878181;
  border-radius: 4px;
`;

const CurrencySliderAmountText = styled.Text`
  color: white;
`;

const CurrencyHintContainer = styled.View`
  gap: 4px;
`;

const CurrencyHintRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CurrencyHintLabel = styled.Text`
  font-size: 12px;
  color: #959595;
`;

const CurrencyHintValueText = styled.Text`
  font-size: 12px;
  color: #373737;
`;

const ActionButtonContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const OrderButton = styled.Pressable<{ tradeMode?: TradeMode }>`
  height: 40px;
  background-color: ${(props) =>
    props.tradeMode === "Buy"
      ? Colors.positiveCandleColor
      : Colors.negativeCandleColor};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const OrderButtonText = styled.Text`
  font-weight: bold;
  color: white;
`;

const BottomSheetViewContainer = styled(BottomSheetView)`
  flex: 1;
  padding-top: 32px;
  padding-bottom: ${Dimensions.get("window").height * 0.3}px;
`;

const TradeTypeButton = styled.Pressable`
  padding: 0 16px;
  height: 60px;
  align-items: flex-start;
  justify-content: center;
`;

const TradeTypeButtonText = styled.Text`
  font-size: 20px;
`;

const OrderListContainer = styled.View`
  flex: 1;
  gap: 8px;
`;

const OrderListTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 0.5px;
  border-color: #e3e3e3;
  padding: 16px;
`;

const OrderListTitleText = styled.Text`
  font-size: 16px;
`;

const OrderListScrollView = styled.View`
  flex: 1;
  padding: 0 16px 32px 16px;
  gap: 16px;
`;

const OrderRowContainer = styled.View``;

const OrderRowHeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  border-color: #e3e3e3;
  margin-bottom: 8px;
`;

const OrderSymbolText = styled.Text`
  font-size: 16px;
`;

const OrderHeaderLeftContainer = styled.View`
  gap: 8px;
`;

const OrderTypeModeContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;
const OrderTypeModeText = styled.Text<{ tradeMode: TradeMode }>`
  font-size: 12px;
  color: ${(props) =>
    props.tradeMode === "Buy"
      ? Colors.positiveCandleColor
      : Colors.negativeCandleColor};
`;

const OrderDateText = styled.Text`
  font-size: 12px;
  color: #a1a1a1;
`;

const OrderHeaderRightContainer = styled.View``;

const OrderFooterContainer = styled.View`
  gap: 8px;
`;

const OrderFooterRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const OrderFooterLabel = styled.Text`
  font-size: 14px;
  color: #a1a1a1;
`;

const OrderFooterValueText = styled.Text`
  font-size: 14px;
`;

const CancelButton = styled.Pressable`
  padding: 4px 8px;
  align-items: center;
  justify-content: center;
  background-color: #ededed;
  border-radius: 8px;
`;

const OrderEmptyContainer = styled.View`
  flex: 1;
  padding: 32px;
  align-items: center;
  justify-content: center;
`;

export default TradesScreen;
