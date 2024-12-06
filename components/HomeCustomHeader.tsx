import React from "react";
import styled from "styled-components/native";
import { Colors } from "@/constants/Colors";

const HomeCustomHeader = () => {
  return (
    <Container>
      <LogoButton>
        <LogoIcon
          source={require("@/assets/images/icons/binance-icon-light.png")}
        />
      </LogoButton>
      <SearchButton>
        <SearchIconImage source={require("@/assets/images/icons/search.png")} />
        <SearchPromotionText>🔥 BNB</SearchPromotionText>
      </SearchButton>
      <OptionIconButton>
        <OptionIconImage
          source={require("@/assets/images/icons/qr-scan.png")}
        />
      </OptionIconButton>
      <OptionIconButton>
        <OptionIconImage
          source={require("@/assets/images/icons/headset.png")}
        />
      </OptionIconButton>
      <OptionIconButton>
        <OptionIconImage source={require("@/assets/images/icons/chat.png")} />
      </OptionIconButton>
      <OptionIconButton>
        <OptionIconImage source={require("@/assets/images/icons/earn.png")} />
      </OptionIconButton>
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 16px;
`;

const LogoButton = styled.Pressable``;

const LogoIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const SearchButton = styled.Pressable`
  height: 24px;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
  border-radius: 8px;
  background-color: ${Colors.light.background};
  gap: 6px;
`;

const SearchIconImage = styled.Image`
  width: 12px;
  height: 12px;
  tint-color: #a1a1a1;
`;

const SearchPromotionText = styled.Text`
  font-size: 12px;
  color: #a1a1a1;
`;

const OptionIconButton = styled.Pressable``;

const OptionIconImage = styled.Image`
  width: 16px;
  height: 16px;
`;

export default HomeCustomHeader;
