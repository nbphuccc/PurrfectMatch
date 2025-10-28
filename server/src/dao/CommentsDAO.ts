import db from "../index.js";

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  body: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export interface NewComment {
  post_id: number;
  author_id: number;
  body: string;
}

/**
 * CommentsDAO
 * -------------
 * Provides raw SQL access to the `comments` table.
 * (No validation, just queries)
 */
export const CommentsDAO = {
  /**
   * Returns all comments for a given community post (newest first)
   */
  listByPost(postId: number): Comment[] {
    const stmt = db.prepare(`
      SELECT 
        c.*, 
        u.username, 
        u.avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `);
    return stmt.all(postId);
  },

  /**
   * Inserts a new comment
   */
  insert(comment: NewComment): number {
    const stmt = db.prepare(`
      INSERT INTO comments (post_id, author_id, body, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(comment.post_id, comment.author_id, comment.body);
    return result.lastInsertRowid as number;
  },

  /**
   * Gets a single comment by ID
   */
  getById(id: number): Comment | undefined {
    const stmt = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Deletes a comment (ownership check happens in service)
   */
  delete(id: number): void {
    const stmt = db.prepare(`DELETE FROM comments WHERE id = ?`);
    stmt.run(id);
  },
};
