import React from "react";
import { Stack } from "expo-router";

const HomeTabs = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={"crypto-search"}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={"[cryptoId]"}
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default HomeTabs;
