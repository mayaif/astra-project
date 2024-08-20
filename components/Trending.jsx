/** @format */

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Video, Audio, ResizeMode } from "expo-av";
import React, { useState } from "react";
import { icons } from "@/constants";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1.1,
  },
};
const zoomOut = {
  0: {
    scale: 1.1,
  },
  1: {
    scale: 0.9,
  },
};
const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);
  const video = React.useRef(null);

  return (
    <Animatable.View
      className="mr-4"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          ref={video}
          source={{
            uri: item.video,
          }}
          className="w-44 h-64 rounded-[20px] mt-3 bg-white/10"
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
          className="relative items-center justify-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-48 h-64 rounded-[20px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[1]);
  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
      contentOffset={{ x: 120 }}
      horizontal
    />
  );
};

export default Trending;
