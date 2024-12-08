import React from "react";
import { Stack } from "expo-router";

const TradesLayout = () => {
  return (
    <Stack initialRouteName={"[cryptoId]"}>
      <Stack.Screen
        name={"[cryptoId]"}
        options={{ title: "Trades", headerShown: false }}
      />
    </Stack>
  );
};

export default TradesLayout;
