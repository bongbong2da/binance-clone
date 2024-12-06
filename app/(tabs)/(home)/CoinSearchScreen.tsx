import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { useNavigation } from "expo-router";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CoinInterface {
  api_symbol: string;
  id: string;
  large: string;
  market_cap_rank: number;
  name: string;
  symbol: string;
  thumb: string;
}

interface CoinWithPriceInterface {
  coin: CoinInterface;
  price: {
    isFetched: boolean;
    price: number;
  };
}

const CoinSearchScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [currentSearchKeyword, setCurrentSearchKeyword] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<CoinWithPriceInterface[]>(
    [],
  );

  const getCoinsQuery = useQuery<{ coins: CoinInterface[] }>({
    queryKey: ["getCoins", currentSearchKeyword],
    queryFn: async () => {
      const response = await axios.get(
        process.env.EXPO_PUBLIC_GECKCO_API_URL + "/search",
        {
          params: {
            query: currentSearchKeyword,
          },
        },
      );

      const coins = response.data.coins;

      const coinsWithPrice = coins.map(
        (coin: CoinInterface, index: number) => ({
          coin,
          price: { isFetched: false, price: 0 },
        }),
      );
      setSearchResult(coinsWithPrice);
      return response.data;
    },
  });

  const getCryptoPrice = async () => {
    if (searchResult[0]?.price.isFetched) return;
    const coinsWithPrice: CoinWithPriceInterface[] = [];

    try {
      searchResult.map(async (coinWithPrice, index) => {
        if (index > 5) return;
        const cryptoPrice = await queryClient.fetchQuery({
          queryKey: ["getCoinPrice", coinWithPrice.coin?.id],
          queryFn: async () => {
            return await axios.get(
              process.env.EXPO_PUBLIC_GECKCO_API_URL + "/simple/price",
              {
                params: {
                  ids: coinWithPrice.coin?.id,
                  vs_currencies: "usd",
                },
              },
            );
          },
          staleTime: 1000 * 60 * 5,
          retryDelay: 1000 * 3,
          retry: 1,
        });
        const price =
          cryptoPrice.data[Object.keys(cryptoPrice.data)[0]].usd || 0;
        coinsWithPrice.push({
          coin: coinWithPrice.coin,
          price: { isFetched: true, price },
        });
      });

      setSearchResult(coinsWithPrice);
    } catch (e) {
      console.error(e);
    }
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
    navigation.goBack();
  };

  const handlePressSearch = async () => {
    getCoinsQuery.refetch();
  };

  const handlePressRemoveHistory = async () => {
    setSearchHistory([]);
    AsyncStorage.removeItem("coin_search_keywords");
  };

  const handlePressCrypto = (coin: CoinInterface) => {
    if (!searchHistory.includes(coin.symbol)) {
      const newKeywords = [coin.symbol, ...searchHistory];
      setSearchHistory(newKeywords);
      AsyncStorage.setItem("coin_search_keywords", newKeywords.join(","));
    }
  };

  const handlePressHistoryKeyword = (keyword: string) => {
    setCurrentSearchKeyword(keyword);
    getCoinsQuery.refetch();
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
            value={currentSearchKeyword}
            onChangeText={setCurrentSearchKeyword}
            placeholder={"🔥 BNB"}
          />
          <SearchButton hitSlop={24} onPress={handlePressSearch}>
            <SearchText>Search</SearchText>
          </SearchButton>
        </SearchInputContainer>
      </HeaderContainer>
      {searchHistory.length > 0 && getCoinsQuery.data?.coins?.length === 0 && (
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
      {getCoinsQuery.data && getCoinsQuery.data.coins?.length > 0 && (
        <ResultContainer
          contentContainerStyle={{
            padding: 16,
          }}
        >
          <ResultHeaderContainer>
            <ResultHeaderTitle>Results</ResultHeaderTitle>
          </ResultHeaderContainer>
          {getCoinsQuery.isFetching && <ActivityIndicator />}
          {searchResult.map((cryptoWithPrice, index) => {
            if (index > 5) return null;
            return (
              <CryptoRow
                key={cryptoWithPrice?.coin?.id}
                onPress={() => handlePressCrypto(cryptoWithPrice.coin)}
              >
                <CryptoNameContainer>
                  <CryptoLogo source={{ uri: cryptoWithPrice?.coin?.thumb }} />
                  <CryptoNameText>
                    {cryptoWithPrice?.coin?.symbol}
                  </CryptoNameText>
                </CryptoNameContainer>
                {cryptoWithPrice?.price?.isFetched && (
                  <CryptoPriceContainer>
                    <Text>{cryptoWithPrice?.price?.price}</Text>
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

export default CoinSearchScreen;
