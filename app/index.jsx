/** @format */

import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";
import CustomButton from "../components/CustomButton";
import { useGlobalContext } from "../context/GlobalProvider";

export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();
  if (!isLoading && isLoggedIn) return <Redirect href="/home" />;
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full items-center justify-center min-h-[85vh] px-4">
          <Image
            source={images.logo}
            className="w-[170px] h-[94px]"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[300px]"
            resizeMode="contain"
          />
          <View className="relative mt-5">
            <Text className="text-2xl text-white font-semibold text-center">
              Share your vision with {""}
              <Text className="text-[#BFF0EA]">Astra</Text>
            </Text>
            <Text className="text-gray-100 text-sm text-center font-pregular mt-7">
              Where your creativity finds a home
            </Text>
            <Text className="text-gray-100 text-sm text-center font-pregular ">
              Start sharing your unique videos with the world
            </Text>
            <CustomButton
              title="Continue with email"
              handlePress={() => router.push("/sign-in")}
              containerStyles="mt-7"
            />
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#1611622" style="light" />
    </SafeAreaView>
  );
}
