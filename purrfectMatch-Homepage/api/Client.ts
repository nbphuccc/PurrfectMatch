import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseURL = () => {
  // 1. ENV override (recommended)
  const env = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (env) return env;

  // 2. Try to extract LAN IP from Expo hostUri (best for real devices)
  const hostUri = Constants.expoConfig?.hostUri;
  const lanHost = hostUri?.split(":")[0];

  if (lanHost && Platform.OS !== "web") {
    // Example: hostUri = "10.0.0.19:8081" → lanHost = "10.0.0.19"
    return `http://${lanHost}:3000`;
  }

  // 3. Platform-specific fallbacks
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000"; // Android emulator
  }

  if (Platform.OS === "ios") {
    return "http://127.0.0.1:3000"; // iOS simulator
  }

  return "http://localhost:3000";
};

const BASE_URL = getBaseURL();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Helper for absolute image URLs
export const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${BASE_URL}${u}`) : "";


