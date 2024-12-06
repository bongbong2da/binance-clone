import { Tabs } from "expo-router";
import React from "react";
import { useRecoilValue } from "recoil";
import { tabBarVisibleAtom } from "@/recoil/atoms/UIAtoms";

const TabLayout = () => {
  const isHide = useRecoilValue(tabBarVisibleAtom);

  return (
    <Tabs>
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarStyle: {
            display: isHide ? "flex" : "none",
          },
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
