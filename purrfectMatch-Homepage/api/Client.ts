import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const fallback =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  (Constants.executionEnvironment === "storeClient" // Expo Go on device
    ? "http://192.168.0.141" // <- changed to my LAN API, nobody hack me lol
    : fallback);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// helper to make image URLs absolute if backend returns "/uploads/..."
export const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${BASE_URL}${u}`) : "";
