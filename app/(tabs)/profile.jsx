/** @format */

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import { getUserPosts, getUserFollowersCount } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import { icons } from "@/constants";
import InfoBox from "@/components/InfoBox";
import { signOut } from "../../lib/appwrite";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [followersCount, setFollowersCount] = useState(0);
  const { data: posts } = useAppwrite(() => getUserPosts(user?.$id));

  useEffect(() => {
    const fetchFollowersCount = async () => {
      if (!user) return;
      try {
        const count = await getUserFollowersCount(user.$id);
        setFollowersCount(count);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFollowersCount();
  }, [user]);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/sign-in");
  };
  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "No",
          onPress: () => console.log("Logout Cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: logout,
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="w-full flex mb-10 px-4">
            <View className="items-end">
              <TouchableOpacity
                className="bg-black-100 rounded-full py-1 pl-2 pr-4 items-center mt-2 gap-x-2 flex flex-row"
                onPress={confirmLogout}
              >
                <AntDesign name="logout" size={24} color="#92F5E9" />
                <Text className="text-base text-gray-100">Logout</Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-lg flex justify-center items-center">
                <Image
                  source={{ uri: user?.avatar }}
                  className="w-16 h-16 rounded-full"
                  resizeMode="cover"
                />
              </View>
              <InfoBox
                title={user?.username}
                containerStyles="mt-2"
                titleStyles="text-lg"
              />
              <View className="mt-2 flex-row">
                <InfoBox
                  title={posts.length || 0}
                  subtitle="Videos"
                  containerStyles="mr-10"
                  titleStyles="text-xl"
                />
                <InfoBox
                  title={followersCount}
                  subtitle="Followers"
                  titleStyles="text-xl"
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No videos found"
            subtitle="You have not uploaded any video yet. Let's change that!"
          />
        )}
      />
      <StatusBar backgroundColor="#1611622" style="light" />
    </SafeAreaView>
  );
};

export default Profile;
