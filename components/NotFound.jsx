/** @format */

import { View, Text, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import { images } from "@/constants";
import CustomButtom from "@/components/CustomButton";

const EmptyState = ({ title, subtitle }) => {
  return (
    <View className="flex justtify-center items-center px-4">
      <Image
        source={images.empty}
        className="h-[270px] [w-215px]"
        resizeMode="contain"
      />
      <Text className="text-xl text-center font-psemibold text-white pb-2">
        {title}
      </Text>
      <Text className="font-pmedium text-center text-gray-100 text-base px-4">
        {subtitle}
      </Text>

      <CustomButtom
        title="Save videos"
        handlePress={() => router.push("/home")}
        containerStyles="w-full my-5"
      />
    </View>
  );
};

export default EmptyState;
