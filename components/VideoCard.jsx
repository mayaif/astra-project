/** @format */

import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Video, ResizeMode } from "expo-av";
import { icons } from "@/constants";
import { addFollower } from "@/lib/appwrite";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { useGlobalContext } from "@/context/GlobalProvider";
const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar, $id },
  },
}) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  // console.log("Creator userId:", $id);

  const handleFollow = async (followedUserId) => {
    console.log("Followed userId in handleFollow:", followedUserId);
    try {
      if (user && user.$id !== followedUserId) {
        const newFollowerData = {
          followerUserId: user.$id,
          followedUserId: followedUserId,
        };
        const newFollower = await addFollower(newFollowerData);
      }
    } catch (error) {
      console.error("Error creating follower:", error);
    }
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-full justify-center items-center">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-gray-100 text-xs font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          <Menu>
            <MenuTrigger>
              <Image
                source={icons.menu}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => handleFollow($id)} text="Follow" />
            </MenuOptions>
          </Menu>
        </View>
      </View>
      {play ? (
        <Video
          source={{
            uri: video,
          }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
