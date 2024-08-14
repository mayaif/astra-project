/** @format */

import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Video, ResizeMode } from "expo-av";
import { icons } from "@/constants";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import {
  addLike,
  removeLikes,
  isAlreadyLiked,
  getLikesCount,
  addSavedVideo,
  removeSavedVideo,
  isVideoSaved,
  deleteUserPost,
} from "@/lib/appwrite";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router"; // Import router for navigation

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    $id: videoId,
    creator: { username, avatar, $id: creatorId },
  },
}) => {
  const { user, refreshSavedVideos, followedUsers, toggleFollowUser } =
    useGlobalContext();
  const [play, setPlay] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (user && user.$id !== creatorId) {
        const alreadyLiked = await isAlreadyLiked(videoId, user.$id);
        setIsLiked(alreadyLiked);
        const alreadySaved = await isVideoSaved(videoId, user.$id);
        setIsSaved(alreadySaved);
      }

      const count = await getLikesCount(videoId);
      setLikesCount(count);
    };

    initializeData();
  }, [user, creatorId, videoId]);

  const handleFollowToggle = () => {
    toggleFollowUser(creatorId);
    const action = followedUsers.has(creatorId)
      ? "Unfollowed"
      : "You are now following";
    Alert.alert(`${action} ${username}`);
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
        Alert.alert("Video saved to Bookmarks");
      }
      refreshSavedVideos();
    } catch (error) {
      console.error("Error toggling save state:", error);
    }
  };

  const handleDeleteVideos = async () => {
    try {
      if (!user || user.$id !== creatorId) return;

      const success = await deleteUserPost(videoId);
      if (success) {
        setIsDeleted(true);
        Alert.alert("Video deleted");
      } else {
        Alert.alert("Failed to delete the video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      Alert.alert("An error occurred while deleting the video");
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video?",
      [
        {
          text: "No",
          onPress: () => console.log("Delete Cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: handleDeleteVideos,
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const navigateToEditScreen = () => {
    router.push({
      pathname: "/edit-video", // Replace with the actual path to your edit screen
      params: { videoId, title, thumbnail, video, prompt: "" }, // Pass necessary data
    });
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
    !isDeleted && (
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
          {user && user.$id === creatorId && (
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
                    onSelect={navigateToEditScreen}
                    className="flex flex-row items-center gap-1 px-3 py-4"
                  >
                    <MaterialIcons name="edit" size={24} color="black" />
                    <Text className="text-base">Edit</Text>
                  </MenuOption>
                  <MenuOption
                    onSelect={confirmDelete}
                    className="flex flex-row items-center gap-1 px-3 py-4"
                  >
                    <MaterialIcons name="delete" size={24} color="black" />
                    <Text className="text-base">Delete</Text>
                  </MenuOption>
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
            <View className="flex flex-row items-center justify-center gap-x-4">
              <TouchableOpacity
                onPress={handleFollowToggle}
                activeOpacity={0.7}
              >
                <SimpleLineIcons
                  name={
                    followedUsers.has(creatorId)
                      ? "user-following"
                      : "user-follow"
                  }
                  size={22}
                  color="white"
                />
              </TouchableOpacity>

              <View className="flex flex-row items-center justify-center gap-2">
                <TouchableOpacity
                  onPress={handleSaveToggle}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={
                      isSaved
                        ? "content-save-move"
                        : "content-save-move-outline"
                    }
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
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
            <Text className="text-white text-base font-pregular pt-1">
              {likesCount}
            </Text>
          </View>
        </View>
      </View>
    )
  );
};

export default VideoCard;
