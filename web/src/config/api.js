import axiosInstance from "./axiosInstance";
import { setToken, setUserId } from "./utils";

// Define APIs

export const google = async (credentials) => {
  const response = await axiosInstance.post("/auth/google", credentials);
  const { token, userId } = response.data;
  setToken(token);
  setUserId(userId);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);

  const { token, userId } = response.data;
  setToken(token);
  setUserId(userId);
  return response.data;
};

export const signup = async (userDetails) => {
  const response = await axiosInstance.post("/auth/register", userDetails);
  console.log("response", response);

  return response.data;
};

export const logout = () => {
  try {
    localStorage.removeItem("token"); // Clear token from storage
  } catch (error) {
    throw new Error("An error occurred during logout.");
  }
};

// File Management APIs

// Generate signed URL for uploading a file
export const getFileUploadURL = async (fileDetails) => {
  const response = await axiosInstance.post(
    "/files/upload-signed-url",
    fileDetails
  );
  return response.data;
};

// Generate signed URL for viewing a file
export const getFileViewURL = async (fileDetails) => {
  const response = await axiosInstance.post(
    "/files/view-signed-url",
    fileDetails
  );
  return response.data;
};

// Create or update file status
export const createOrUpdateFileStatus = async (fileDetails) => {
  const response = await axiosInstance.post("/files/status", fileDetails);
  return response.data;
};

// Fetch metadata for a specific file
export const getFileMetadata = async (fileName) => {
  const response = await axiosInstance.get(`/files/${fileName}`);
  return response.data;
};

// Update the transcription status of a file
export const updateTranscriptionStatus = async (fileDetails) => {
  const response = await axiosInstance.patch(
    "/files/transcription-status",
    fileDetails
  );
  return response.data;
};

// List all files with optional filters
export const listFiles = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await axiosInstance.get(`/files?${queryParams}`);
  return response.data;
};

// Delete a file and its metadata
export const deleteFile = async (fileId) => {
  const response = await axiosInstance.delete(`/files/${fileId}`);
  return response.data;
};

// Delete a file and its metadata
export const getFileList = async () => {
  const response = await axiosInstance.get(`/files/getFileList`);
  return response.data;
};

export const bulkTranscribeFile = async (fileDetails) => {
  const response = await axiosInstance.post(
    `/files/start-transcription`,
    fileDetails
  );
  return response.data;
};

export const getTranscriptionLogs = async (fileDetails) => {
  const response = await axiosInstance.post(`/logs/file`, fileDetails);
  return response.data;
};

export const getAvailableFiles = async () => {
  const response = await axiosInstance.get(`/conversation/eligible-files`);
  return response.data;
};

export const getConversationFiles = async () => {
  const response = await axiosInstance.get(`/conversation`);
  return response.data;
};

export const getConversationDetails = async (conversationId) => {
  const response = await axiosInstance.get(`/conversation/${conversationId}`);
  return response.data;
};

export const createConversation = async (conversationDetails) => {
  const response = await axiosInstance.post(
    "chat/conversation",
    conversationDetails
  );
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await axiosInstance.delete(`conversation/${conversationId}`);
  return response.data;
};

export const sendChatMessage = async ({
  conversationId,
  message,
  isRetry = false,
  editChatId = null,
}) => {
  const response = await axiosInstance.post(`chat/create-chat`, {
    conversationId: conversationId,
    query: message,
    isRetry,
    editChatId,
  });
  return response.data;
};

export const getSuggestionsForChat = async ({ conversationId }) => {
  const response = await axiosInstance.post(`conversation/get-suggestion`, {
    conversationId: conversationId,
  });
  return response.data;
};
