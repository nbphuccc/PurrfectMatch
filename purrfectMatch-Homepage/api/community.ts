import { api } from "./Client";

export type CommunityCreateDTO = {
  author_id: number;
  title: string;
  description: string;
  image_url?: string | null;
};

// Add a comment to a playdate post
export async function addComment(postId: number, content: string) {
  const { data } = await api.post("/comments", { postId, content });
  return data;
}

// Fetch comments for a specific playdate post
export async function getComments(postId: number) {
  const { data } = await api.get("/comments", { params: { postId } });
  return data as { items: { id: number; author_id: number; content: string; created_at: string }[] };
}

export async function createCommunityPost(dto: CommunityCreateDTO) {
  const { data } = await api.post("/community", dto);
  return data;
}

export async function listCommunity(params?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/community", { params });
  return data as { items: any[]; page: number; limit: number };
}