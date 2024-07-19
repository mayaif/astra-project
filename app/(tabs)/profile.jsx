/** @format */

import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import { getUserPosts } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import { icons } from "@/constants";
import InfoBox from "@/components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

  const logout = () => {};
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>
            <View className="w-16 h-16  rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
            </View>
            <InfoBox />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No videos found"
            subtitle="No video found for this search query"
          />
        )}
      />
      <StatusBar backgroundColor="#1611622" style="light" />
    </SafeAreaView>
  );
};

export default Profile;
