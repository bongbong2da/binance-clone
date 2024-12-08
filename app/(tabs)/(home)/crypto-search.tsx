import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRecoilState } from "recoil";
import { standardCurrencyAtom } from "@/recoil/atoms/CurrencyAtoms";
import { ExchangeInfo, TickerPrice } from "@/types/binance/types";
import _ from "lodash";

interface SymbolWithPrice {
  symbol: any;
  price: TickerPrice;
}

const CryptoSearch = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [standardCurrency, setStandardCurrency] =
    useRecoilState(standardCurrencyAtom);

  const [currentExchangeInfo, setCurrentExchangeInfo] =
    useState<ExchangeInfo>();
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState<string>("");
  const [currentSearchedCoin, setCurrentSearchedCoin] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<SymbolWithPrice[]>([]);

  const getCoinsQuery = useQuery({
    queryKey: ["getCoins", currentSearchKeyword],
    queryFn: async () => {
      console.log("currentSearchKeyword", currentSearchKeyword);
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + `/search`,
        {
          params: {
            query: currentSearchKeyword,
          },
        },
      );

      setCurrentSearchedCoin(response.data.coins);

      const prices: SymbolWithPrice[] = [];

      await Promise.all(
        response.data.coins.map(async (coin: any) => {
          try {
            const response = await getTickerPrice(coin.symbol);
            prices.push({ symbol: coin, price: response });
          } catch (e) {
            //
          }
        }),
      );

      setSearchResult(prices);

      return response.data;
    },
  });

  const getExchangeInfo = useQuery<ExchangeInfo>({
    queryKey: ["getExchangeInfo", currentSearchKeyword],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_BINANCE_API_URL +
          `/api/v3/exchangeInfo?symbol=${currentSearchKeyword.toUpperCase() + standardCurrency}`,
      );

      setCurrentExchangeInfo(response.data);

      return response.data;
    },
  });

  const getTickerPrice = async (symbol: string) => {
    return queryClient.fetchQuery({
      queryKey: ["getTickerPrice", symbol],
      queryFn: async () => {
        const response = await axios.get(
          process.env.EXPO_PUBLIC_BINANCE_API_URL +
            `/api/v3/ticker/price?symbol=${symbol.toUpperCase() + standardCurrency}`,
        );

        return response.data;
      },
      retry: false,
    });
  };

  const init = async () => {
    const previousKeywordsString = await AsyncStorage.getItem(
      "coin_search_keywords",
    );
    if (previousKeywordsString) {
      const previousKeywordArray = previousKeywordsString.split(",");
      setSearchHistory(previousKeywordArray);
    }
  };

  const handlePressBack = () => {
    router.back();
  };

  const handlePressSearch = async () => {
    getExchangeInfo.refetch();
  };

  const handlePressRemoveHistory = async () => {
    setSearchHistory([]);
    AsyncStorage.removeItem("coin_search_keywords");
  };

  const handlePressCrypto = (symbol: string) => {
    if (!searchHistory.includes(symbol)) {
      const newKeywords = [symbol, ...searchHistory];
      setSearchHistory(newKeywords);
      AsyncStorage.setItem("coin_search_keywords", newKeywords.join(","));
    }

    router.navigate(
      `/(tabs)/(home)/${symbol.toUpperCase() + standardCurrency}`,
    );
  };

  const handlePressHistoryKeyword = (keyword: string) => {
    setCurrentSearchKeyword(keyword);
    getExchangeInfo.refetch();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <BackButton onPress={handlePressBack}>
          <BackIcon source={require("@/assets/images/icons/back.png")} />
        </BackButton>
        <SearchInputContainer>
          <SearchIcon source={require("@/assets/images/icons/search.png")} />
          <SearchInput
            onChangeText={_.debounce(setCurrentSearchKeyword, 1000)}
            placeholder={"🔥 BNB"}
          />
          <SearchButton hitSlop={24} onPress={handlePressSearch}>
            <SearchText>Search</SearchText>
          </SearchButton>
        </SearchInputContainer>
      </HeaderContainer>
      {searchHistory.length > 0 && currentSearchKeyword === "" && (
        <SearchHistoryContainer>
          <SearchHistoryTitleContainer>
            <SearchText>Search History</SearchText>
            <Pressable onPress={handlePressRemoveHistory} hitSlop={20}>
              <TrashIcon
                source={require("@/assets/images/icons/trash-can.png")}
              />
            </Pressable>
          </SearchHistoryTitleContainer>
          <SearchKeywordContainer>
            {searchHistory.map((keyword, index) => {
              return (
                <KeywordButton
                  key={index}
                  onPress={() => handlePressHistoryKeyword(keyword)}
                >
                  <KeywordButtonText>{keyword}</KeywordButtonText>
                </KeywordButton>
              );
            })}
          </SearchKeywordContainer>
        </SearchHistoryContainer>
      )}
      {getExchangeInfo.data && searchResult?.length > 0 && (
        <ResultContainer
          contentContainerStyle={{
            padding: 16,
          }}
        >
          <ResultHeaderContainer>
            <ResultHeaderTitle>Results</ResultHeaderTitle>
          </ResultHeaderContainer>
          {getExchangeInfo.isFetching && <ActivityIndicator />}
          {searchResult?.map((symbol, index) => {
            return (
              <CryptoRow
                key={symbol.symbol.symbol}
                onPress={() => handlePressCrypto(symbol.symbol.symbol)}
              >
                <CryptoNameContainer>
                  <CryptoLogo source={{ uri: symbol.symbol?.thumb }} />
                  <CryptoNameText>
                    {symbol.symbol.symbol + standardCurrency}
                  </CryptoNameText>
                </CryptoNameContainer>
                {symbol.price?.price && (
                  <CryptoPriceContainer>
                    <Text>{Number(symbol.price?.price).toFixed(2)}</Text>
                  </CryptoPriceContainer>
                )}
              </CryptoRow>
            );
          })}
        </ResultContainer>
      )}
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const HeaderContainer = styled.View`
  padding: 0 16px;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const BackButton = styled.Pressable``;

const BackIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const SearchInputContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background-color: ${Colors.light.background};
  padding: 4px 8px;
  border-radius: 8px;
  height: 30px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 12px;
`;

const SearchButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;
const SearchText = styled.Text`
  font-size: 14px;
`;
const SearchIcon = styled.Image`
  width: 12px;
  height: 12px;
  tint-color: #a1a1a1;
`;

const SearchHistoryContainer = styled.View`
  padding: 16px;
`;

const SearchHistoryTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SearchKeywordContainer = styled.View`
  flex-direction: row;
  padding: 16px 0;
  gap: 8px;
`;

const KeywordButton = styled.Pressable`
  padding: 4px 8px;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.light.background};
  border-radius: 4px;
  align-self: flex-start;
`;

const KeywordButtonText = styled.Text``;

const TrashIcon = styled.Image`
  width: 16px;
  height: 16px;
  tint-color: #a1a1a1;
`;

const ResultContainer = styled.ScrollView`
  flex: 1;
`;

const ResultHeaderContainer = styled.View`
  padding: 8px 0;
`;

const ResultHeaderTitle = styled.Text`
  font-size: 12px;
`;

const EmptyContainer = styled.View``;

const CryptoRow = styled.Pressable`
  padding: 12px 0;
  flex-direction: row;
  align-items: center;
`;

const CryptoNameContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CryptoNameText = styled.Text`
  font-size: 12px;
`;

const CryptoLogo = styled.Image`
  width: 16px;
  height: 16px;
`;

const CryptoPriceContainer = styled.View``;

export default CryptoSearch;
