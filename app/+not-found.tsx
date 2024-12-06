import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import React from "react";

const NotFoundScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Page not found" }} />
      <View>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/(tabs)/(home)">
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
};

export default NotFoundScreen;
