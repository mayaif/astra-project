/** @format */

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { router, usePathname } from "expo-router";
import { icons } from "../constants";

const SearchInput = ({ initialQuery }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  return (
    <View className="h-16 bg-black-100 border-gray-700 px-4 w-full border-2 rounded-2xl focus:border-secondary flex-row items-center space-x-4">
      <TextInput
        className=" text-white font-pregular text-base flex-1 mt-0.5"
        value={query}
        placeholder="Search for a video topic"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
      />
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            Alert.alert(
              "Missing query",
              "Please input something to search results across database"
            );
          } else if (pathname.startsWith("/search")) {
            return router.setParams({ query });
          } else {
            return router.push(`/search/${query}`);
          }
        }}
      >
        <Image source={icons.search} resizeMode="contain" className="w-5 h-5" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
