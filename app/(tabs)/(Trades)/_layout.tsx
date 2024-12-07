import React from "react";
import { Stack } from "expo-router";

const TradesLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name={"index"}
        options={{ title: "Trades", headerShown: false }}
      />
    </Stack>
  );
};

export default TradesLayout;
