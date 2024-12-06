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
        name={"CryptoSearchScreen"}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={"CryptoViewScreen"}
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default HomeTabs;
