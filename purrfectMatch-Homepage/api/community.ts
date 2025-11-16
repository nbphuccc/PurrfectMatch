import { api } from "./Client";

// Client-side create DTO: includes UI fields petType and category.
// createCommunityPost maps this shape to the server-required fields.
export type CommunityCreateDTO = {
  petType?: string | null;
  category?: string | null;
  description: string;
  image?: string | null;
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
  // Map client DTO to server DTO expected by server/src/routes/community.ts
  // For now, we default author_id to 1 (to be replaced with actual user ID later)
  const serverDto = {
    author_id: 1,
    title: `${dto.category ?? 'Other'} - ${dto.petType ?? 'All Pets'}`,
    description: dto.description,
    image_url: dto.image ?? null,
  };

  const { data } = await api.post("/community", serverDto);
  return data;
}

export async function listCommunity(params?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get("/community", { params });
  return data as { items: any[]; page: number; limit: number };
}