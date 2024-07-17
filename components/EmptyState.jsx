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

      <Text className="font-pmedium text-base text-gray-100">{subtitle}</Text>
      <Text className="text-xl tex-center font-psemibold text-white">
        {title}
      </Text>
      <CustomButtom
        title="Create video"
        handlePress={() => router.push("/create")}
        containerStyles="w-full my-5"
      />
    </View>
  );
};

export default EmptyState;
