/** @format */

import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Video, ResizeMode } from "expo-av";
import { icons } from "@/constants";
import {
  addFollower,
  isAlreadyFollowing,
  removeFollower,
} from "@/lib/appwrite";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { useGlobalContext } from "@/context/GlobalProvider";

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar, $id: creatorId },
  },
}) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && user.$id !== creatorId) {
        const alreadyFollowing = await isAlreadyFollowing(user.$id, creatorId);
        setIsFollowing(alreadyFollowing);
      }
    };

    checkFollowStatus();
  }, [user, creatorId]);

  const handleFollowToggle = async () => {
    try {
      if (!user || user.$id === creatorId) return;

      if (isFollowing) {
        const success = await removeFollower(user.$id, creatorId);
        if (success) {
          setIsFollowing(false);
          Alert.alert(`Unfollowed ${username}`);
        }
      } else {
        const newFollowerData = {
          followerUserId: user.$id,
          followedUserId: creatorId,
        };
        await addFollower(newFollowerData);
        setIsFollowing(true);
        Alert.alert(`You are now following ${username}`);
      }
    } catch (error) {
      console.error("Error toggling follow state:", error);
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
              className="text-white font-semibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-gray-100 text-xs font-regular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        {user && user.$id !== creatorId && (
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
                <MenuOption
                  onSelect={handleFollowToggle}
                  text={isFollowing ? "Unfollow" : "Follow"}
                />
              </MenuOptions>
            </Menu>
          </View>
        )}
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
