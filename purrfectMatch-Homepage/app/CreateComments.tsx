import React, { useState, useEffect } from "react";

type Comment = {
  id: number;
  author_id: number;
  content: string;
  created_at: string;
};

type CreateCommentsProps = {
  postId: number;
  fetchComments: (postId: number) => Promise<{ items: Comment[] }>;
  addComment: (postId: number, content: string) => Promise<any>;
};

export function CreateComments({ postId, fetchComments, addComment }: CreateCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with your auth logic

  // Fetch comments when the component mounts
  useEffect(() => {
    const loadComments = async () => {
      const data = await fetchComments(postId);
      setComments(data.items);
    };

    loadComments();
  }, [postId, fetchComments]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment(postId, newComment);
      setNewComment("");
      const updatedComments = await fetchComments(postId);
      setComments(updatedComments.items);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!isAuthenticated) {
    return <p>You must be logged in to comment.</p>;
  }

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>User {comment.author_id}:</strong> {comment.content}
          </li>
        ))}
      </ul>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={handleAddComment}>Add Comment</button>
    </div>
  );
}