/** @format */

import React, { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import NotFound from "@/components/NotFound";
import VideoCard from "@/components/VideoCard";
import useAppwrite from "@/lib/useAppwrite";
import { getSavedVideos } from "@/lib/appwrite";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing();
    await refetchData();
    setRefreshing(false);
  };
  const { data: savedVideos, refetchData } = useAppwrite(() =>
    getSavedVideos(user.$id)
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={savedVideos}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-8 px-4 space-y-6">
            <View>
              <Text className="text-white font-psemibold text-2xl">
                Saved videos
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <NotFound
            title="No saved videos"
            subtitle="You haven't saved any videos. Let's change that!"
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />
      <StatusBar backgroundColor="#1611622" style="light" />
    </SafeAreaView>
  );
};

export default Bookmark;
