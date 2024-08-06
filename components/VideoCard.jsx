/** @format */

import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Video, ResizeMode } from "expo-av";
import { icons } from "@/constants";
import AntDesign from "@expo/vector-icons/AntDesign";

import {
  addFollower,
  isAlreadyFollowing,
  removeFollower,
  addLike,
  removeLikes,
  isAlreadyLiked,
  getLikesCount,
  addSavedVideo,
  removeSavedVideo,
  isVideoSaved,
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
    $id: videoId,
    creator: { username, avatar, $id: creatorId },
  },
}) => {
  const { user, refreshSavedVideos } = useGlobalContext(); // Include refreshSavedVideos to update context
  const [play, setPlay] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (user && user.$id !== creatorId) {
        const alreadyFollowing = await isAlreadyFollowing(user.$id, creatorId);
        setIsFollowing(alreadyFollowing);

        const alreadyLiked = await isAlreadyLiked(videoId, user.$id);
        setIsLiked(alreadyLiked);

        const alreadySaved = await isVideoSaved(videoId, user.$id); // Check if video is saved
        setIsSaved(alreadySaved);
      }

      const count = await getLikesCount(videoId);
      setLikesCount(count);
    };

    initializeData();
  }, [user, creatorId, videoId]);

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

  const handleSaveToggle = async () => {
    try {
      if (!user || user.$id === creatorId) return;

      if (isSaved) {
        const success = await removeSavedVideo(videoId, user.$id);
        if (success) {
          setIsSaved(false);
          Alert.alert("Video unsaved");
        }
      } else {
        await addSavedVideo(videoId, user.$id);
        setIsSaved(true);
        Alert.alert("Video saved");
      }
      refreshSavedVideos(); // Refresh the saved videos in the global context
    } catch (error) {
      console.error("Error toggling save state:", error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (!user || user.$id === creatorId) return;

      if (isLiked) {
        const success = await removeLikes(videoId, user.$id);
        if (success) {
          setIsLiked(false);
          setLikesCount(likesCount - 1);
        }
      } else {
        await addLike(videoId, user.$id);
        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error("Error toggling like state:", error);
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
                  onSelect={handleSaveToggle}
                  text={isSaved ? "Unsave" : "Save"}
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
      <View className="flex flex-row items-center justify-center mt-4 gap-x-4">
        {user && user.$id !== creatorId && (
          <View className="">
            <TouchableOpacity onPress={handleFollowToggle} activeOpacity={0.6}>
              <View className="px-3 py-1 rounded-sm bg-gray-50">
                <Text className="font-pregular text-sm">
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <View className="flex- flex-row items-center justify-center gap-2">
          <TouchableOpacity onPress={handleLikeToggle} activeOpacity={0.7}>
            <AntDesign
              name={isLiked ? "like1" : "like2"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text className="text-white font-pregular pt-1">{likesCount}</Text>
        </View>
      </View>
    </View>
  );
};

export default VideoCard;
