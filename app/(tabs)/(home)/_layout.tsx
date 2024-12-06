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
    </Stack>
  );
};

export default HomeTabs;