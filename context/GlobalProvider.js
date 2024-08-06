/** @format */

import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  getSavedVideos,
  addSavedVideo,
  removeSavedVideo,
} from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsLoggedIn(true);
          setUser(currentUser);
          await fetchSavedVideos(currentUser.$id);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setSavedVideos([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchSavedVideos = async (userId) => {
    if (!userId) return;
    try {
      const videos = await getSavedVideos(userId);
      setSavedVideos(videos);
    } catch (error) {
      console.error("Error fetching saved videos:", error);
    }
  };

  const saveVideo = async (videoId) => {
    if (!user) return;
    try {
      await addSavedVideo(videoId, user.$id);
      await fetchSavedVideos(user.$id);
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  const unsaveVideo = async (videoId) => {
    if (!user) return;
    try {
      await removeSavedVideo(videoId, user.$id);
      await fetchSavedVideos(user.$id);
    } catch (error) {
      console.error("Error unsaving video:", error);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        savedVideos,
        saveVideo,
        unsaveVideo,
        refreshSavedVideos: () => fetchSavedVideos(user ? user.$id : null),
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
