/** @format */

import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Storage,
  Query,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.mi.astra",
  projectId: "66926cd6001e50283c36",
  databaseId: "66927160003487dd78c4",
  userCollectionId: "669272770026c875943d",
  videoCollectionId: "669272b300386891bd53",
  storageId: "6692753d00299cb7efed",
  followersCollectionId: "66aa5f1e00145c39bcba",
  likesCollectionId: "66acb152001755518b48",
  saveVideosCollectionId: "66b2250900356517415a",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
  followersCollectionId,
  likesCollectionId,
  saveVideosCollectionId,
} = config;
// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw new Error();

    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAccount = async () => {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt", Query.limit(7)),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId, [Query.orderDesc("$createdAt")]),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }
    if (!fileUrl) throw Error;
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };
  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );
    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

// Followers
export const addFollower = async (followerData) => {
  try {
    const newFollower = await databases.createDocument(
      databaseId,
      followersCollectionId,
      ID.unique(),
      followerData
    );
    return newFollower;
  } catch (error) {
    throw new Error(error);
  }
};

export const removeFollower = async (followerUserId, followedUserId) => {
  try {
    const followers = await databases.listDocuments(
      databaseId,
      followersCollectionId,
      [
        Query.equal("followerUserId", followerUserId),
        Query.equal("followedUserId", followedUserId),
      ]
    );

    if (followers.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        followersCollectionId,
        followers.documents[0].$id
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error removing follower:", error);
    return false;
  }
};

export const isAlreadyFollowing = async (followerUserId, followedUserId) => {
  try {
    const followers = await databases.listDocuments(
      databaseId,
      followersCollectionId,
      [
        Query.equal("followerUserId", followerUserId),
        Query.equal("followedUserId", followedUserId),
      ]
    );
    return followers.documents.length > 0;
  } catch (error) {
    console.error("Error checking follower status:", error);
    return false;
  }
};

export const getUserFollowersCount = async (userId) => {
  try {
    const followers = await databases.listDocuments(
      databaseId,
      followersCollectionId,
      [Query.equal("followedUserId", userId)]
    );
    return followers.total;
  } catch (error) {
    throw new Error(error);
  }
};
export const getFollowedUsers = async (followerUserId) => {
  try {
    const followers = await databases.listDocuments(
      databaseId,
      followersCollectionId,
      [Query.equal("followerUserId", followerUserId)]
    );

    return new Set(followers.documents.map((doc) => doc.followedUserId));
  } catch (error) {
    console.error("Error fetching followed users:", error);
    return new Set();
  }
};

//Likes
export const addLike = async (videoId, userId) => {
  try {
    const newLike = await databases.createDocument(
      databaseId,
      likesCollectionId,
      ID.unique(),
      { videoId, userId }
    );
    return newLike;
  } catch (error) {
    console.error("Error adding like:", error);
    throw new Error(error);
  }
};

export const removeLikes = async (videoId, userId) => {
  try {
    const likes = await databases.listDocuments(databaseId, likesCollectionId, [
      Query.equal("videoId", videoId),
      Query.equal("userId", userId),
    ]);
    if (likes.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        likesCollectionId,
        likes.documents[0].$id
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing like:", error);
    return false;
  }
};

export const isAlreadyLiked = async (videoId, userId) => {
  try {
    const likes = await databases.listDocuments(databaseId, likesCollectionId, [
      Query.equal("videoId", videoId),
      Query.equal("userId", userId),
    ]);
    return likes.documents.length > 0;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
};

export const getLikesCount = async (videoId) => {
  try {
    const likes = await databases.listDocuments(databaseId, likesCollectionId, [
      Query.equal("videoId", videoId),
    ]);
    return likes.total;
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return 0;
  }
};

//Save video
export const addSavedVideo = async (videoId, userId) => {
  try {
    const newSavedVideo = await databases.createDocument(
      databaseId,
      saveVideosCollectionId,
      ID.unique(),
      { videoId, userId }
    );
    return newSavedVideo;
  } catch (error) {
    console.error("Error saving video:", error);
  }
};
export const removeSavedVideo = async (videoId, userId) => {
  try {
    const savedVideos = await databases.listDocuments(
      databaseId,
      saveVideosCollectionId,
      [Query.equal("videoId", videoId), Query.equal("userId", userId)]
    );
    if (savedVideos.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        saveVideosCollectionId,
        savedVideos.documents[0].$id
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing saved video:", error);
    return false;
  }
};

export const isVideoSaved = async (videoId, userId) => {
  try {
    const savedVideos = await databases.listDocuments(
      databaseId,
      saveVideosCollectionId,
      [Query.equal("videoId", videoId), Query.equal("userId", userId)]
    );
    return savedVideos.documents.length > 0;
  } catch (error) {
    console.error("Error checking save status", error);
    return false;
  }
};

export const getSavedVideos = async (userId) => {
  try {
    const savedVideos = await databases.listDocuments(
      databaseId,
      saveVideosCollectionId,
      [Query.equal("userId", userId)]
    );

    if (!savedVideos.documents.length) {
      console.log("No saved videos found for this user.");
      return [];
    }
    // Extract videoIds from saved video entries
    const videoIds = savedVideos.documents.map((doc) => doc.videoId);
    // Fetch video details for each videoId
    const videoDetailsPromises = videoIds.map(async (videoId) => {
      try {
        const video = await databases.getDocument(
          databaseId,
          videoCollectionId,
          videoId
        );
        // Extract creator's $id
        const creatorId = video.creator.$id;
        if (typeof creatorId !== "string" || creatorId.length === 0) {
          throw new Error("Invalid creator ID");
        }

        return {
          ...video,
          creatorId,
        };
      } catch (err) {
        console.error(`Failed to fetch video with ID: ${videoId}`, err);
        return null;
      }
    });

    const videoDetails = await Promise.all(videoDetailsPromises);
    // Filter out null results (failed fetches)
    const validVideoDetails = videoDetails.filter((video) => video !== null);
    // Extract creator IDs
    const creatorIds = validVideoDetails.map((video) => video.creatorId);
    // Remove duplicates from creatorIds
    const uniqueCreatorIds = [...new Set(creatorIds)];
    // Fetch creator details for each unique creatorId
    const creatorDetailsPromises = uniqueCreatorIds.map(async (creatorId) => {
      try {
        return await databases.getDocument(
          databaseId,
          userCollectionId,
          creatorId
        );
      } catch (err) {
        console.error(`Failed to fetch creator with ID: ${creatorId}`, err);
        return null;
      }
    });

    const creatorDetails = await Promise.all(creatorDetailsPromises);

    const validCreatorDetails = creatorDetails.filter(
      (creator) => creator !== null
    );
    const creatorMap = validCreatorDetails.reduce((map, creator) => {
      map[creator.$id] = creator;
      return map;
    }, {});
    // Combine video details with creator info
    const videosWithCreators = validVideoDetails.map((video) => ({
      ...video,
      creator: creatorMap[video.creatorId] || video.creator,
    }));

    return videosWithCreators;
  } catch (error) {
    console.error("Error fetching saved videos:", error);
    return [];
  }
};
