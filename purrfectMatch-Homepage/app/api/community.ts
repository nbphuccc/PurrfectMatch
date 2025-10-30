import { api } from "./Client";

export type CommunityCreateDTO = {
  author_id: number;
  title: string;
  description: string;
  image_url?: string | null;
};

export async function createCommunityPost(dto: CommunityCreateDTO) {
  const { data } = await api.post("/community", dto);
  return data;
}

export async function listCommunity(params?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/community", { params });
  return data as { items: any[]; page: number; limit: number };
}