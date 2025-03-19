import { useState } from "react";
import "./updateComment.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateComment({ comment, setOpenUpdate }) {
  const [text, setText] = useState(comment.text);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedComment) =>
      makeRequest.put(`/comments/${comment.id}`, updatedComment),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", comment.postId]);
      toast.success("Comment updated.");
    },

    onError: (error) => console.error("Error updating comment:", error),
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if comment has been modified
    if (text?.trim() === comment.text?.trim()) {
      toast.info("No changes detected.");
      return;
    }

    // Check comment length
    if (text?.trim()?.length === 0) {
      toast.error("You must add a text to your comment.");
      return;
    }

    if (text?.trim()?.length > 500) {
      toast.error("Your comment can't contain more than 500\u00A0characters.");
      return;
    }

    // Prepare updated data
    const updatedComment = {
      ...comment,
      text: text.trim(),
    };

    // Trigger mutation to update database
    updateMutation.mutate(updatedComment);
    setOpenUpdate(false); // Close form
  };

  return (
    <>
      <div className="updateComment">
        <div className="wrapper">
          <h1>Update Your Comment</h1>

          <form name="update-comment-form">
            <label htmlFor="text">Add a new text</label>
            <textarea
              id="text"
              name="text"
              rows={5}
              placeholder="Write a text..."
              maxLength={500}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button className="update-btn" onClick={handleClick}>
              Update
            </button>
          </form>

          <button className="close" onClick={() => setOpenUpdate(false)}>
            X
          </button>
        </div>
      </div>

      <Overlay />
    </>
  );
}
