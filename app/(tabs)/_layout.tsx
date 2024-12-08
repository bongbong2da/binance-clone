import { Tabs } from "expo-router";
import React from "react";
import { useRecoilValue } from "recoil";
import { tabBarVisibleAtom } from "@/recoil/atoms/UIAtoms";
import styled from "styled-components/native";

type TabType = "home" | "trades";

const TabLayout = () => {
  const isHide = useRecoilValue(tabBarVisibleAtom);

  const renderTabBarIcon = (props: { focused: boolean }, tab: TabType) => {
    let source;
    switch (tab) {
      case "home":
        source = require("@/assets/images/icons/home.png");
        break;
      case "trades":
        source = require("@/assets/images/icons/trade.png");
        break;
    }

    if (!source) return null;

    return <TabBarIcon source={source} isFocused={props.focused} />;
  };

  return (
    <Tabs initialRouteName={"(home)"}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarStyle: {
            display: isHide ? "flex" : "none",
          },
          tabBarActiveTintColor: "#000",
          tabBarIcon: (props) => renderTabBarIcon(props, "home"),
        }}
      />
      <Tabs.Screen
        name="(trades)"
        options={{
          title: "Trades",
          headerShown: false,
          tabBarStyle: {
            display: isHide ? "flex" : "none",
          },
          tabBarActiveTintColor: "#000",
          tabBarIcon: (props) => renderTabBarIcon(props, "trades"),
        }}
      />
    </Tabs>
  );
};

const TabBarIcon = styled.Image<{ isFocused: boolean }>`
  width: 24px;
  height: 24px;
  tint-color: ${({ isFocused }) => (isFocused ? "#000" : "#9f9f9f")};
`;

export default TabLayout;
