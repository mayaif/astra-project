/** @format */

import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  getSavedVideos,
  addSavedVideo,
  removeSavedVideo,
  getFollowedUsers,
  addFollower,
  removeFollower,
} from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsLoggedIn(true);
          setUser(currentUser);
          await fetchSavedVideos(currentUser.$id);
          await updateFollowedUsers(currentUser.$id);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setSavedVideos([]);
          setFollowedUsers(new Set());
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
  const updateFollowedUsers = async (userId) => {
    if (!userId) return;
    try {
      const followedSet = await getFollowedUsers(userId);
      setFollowedUsers(followedSet);
    } catch (error) {
      console.error("Error updating followed users:", error);
    }
  };
  const toggleFollowUser = async (creatorId) => {
    if (!user || user.$id === creatorId) return;

    try {
      const isFollowing = followedUsers.has(creatorId);
      if (isFollowing) {
        const success = await removeFollower(user.$id, creatorId);
        if (success) {
          setFollowedUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(creatorId);
            return newSet;
          });
        }
      } else {
        const newFollowerData = {
          followerUserId: user.$id,
          followedUserId: creatorId,
        };
        await addFollower(newFollowerData);
        setFollowedUsers((prev) => new Set(prev).add(creatorId));
      }
    } catch (error) {
      console.error("Error toggling follow state:", error);
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
        followedUsers,
        toggleFollowUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
