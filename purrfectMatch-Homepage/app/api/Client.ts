import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:3000"; // fallback for iOS simulator / web

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
