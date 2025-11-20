import { api } from "./Client";

interface SignupData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  loginId: string;  // Can be email or username
  password: string;
}

interface AuthResponse {
  ok: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export async function signup(
  { email, username, password }: SignupData
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/auth/signup",
    { email, username, password }
  );
  return data;
}

export async function login(
  { loginId, password }: LoginData
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/auth/login",
    { loginId, password }
  );
  return data;
}