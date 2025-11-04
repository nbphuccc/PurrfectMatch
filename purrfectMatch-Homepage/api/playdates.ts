import { api } from "./Client";

export type PlaydateCreateDTO = {
  author_id: number;
  title: string;
  description: string;
  dog_breed: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  when_at: string;
  place: string;
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

export async function createPlaydatePost(dto: PlaydateCreateDTO) {
  const { data } = await api.post("/playdates", dto);
  return data;
}

export async function listPlaydates(params?: { city?: string; q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/playdates", { params });
  return data as { items: any[]; page: number; limit: number };
}
