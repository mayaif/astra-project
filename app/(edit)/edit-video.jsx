/** @format */

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { updateVideo } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

const EditVideo = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoId, title, thumbnail, video, prompt } = params;

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: title || "",
    video: video || null,
    thumbnail: thumbnail || "",
    prompt: prompt || "",
  });

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: result.assets[0] });
      }
      if (selectType === "video") {
        setForm({ ...form, video: result.assets[0] });
      }
    }
  };

  const submit = async () => {
    const payload = {};

    if (form.title) {
      payload.title = form.title;
    }

    if (form.prompt) {
      payload.prompt = form.prompt;
    }

    if (form.video && form.video.uri) {
      payload.video = form.video;
    } else if (!form.video.uri) {
      payload.video = null;
    }

    if (form.thumbnail && form.thumbnail.uri) {
      payload.thumbnail = form.thumbnail;
    } else if (!form.thumbnail.uri) {
      payload.thumbnail = null;
    }

    setUploading(true);
    try {
      await updateVideo(videoId, payload);
      Alert.alert("Success", "Video updated successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update the video.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView className="px-4 my-6">
        <Text className="text-white font-psemibold text-2xl">Edit Video</Text>
        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload video
          </Text>
          <TouchableOpacity onPress={() => openPicker("video")}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri || form.video }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail image
          </Text>
          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri || form.thumbnail }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center flex-row border-2 border-black-200 space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-7 h-7"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField
          title="Prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />
        <CustomButton
          title="Submit changes"
          handlePress={submit}
          isLoading={uploading}
          containerStyles="mt-7"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditVideo;
