import { api } from "./Client";

interface SignupData {
  email: string;
  username: string;
  password: string;
}

export async function signup(
  { email, username, password }: SignupData
): Promise<{ ok: boolean; message: string }> {

  const { data } = await api.post<{ ok: boolean; message: string }>(
    "/auth/signup",
    { email, username, password }
  );

  return data;
}