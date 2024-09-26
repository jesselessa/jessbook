import { useState } from "react";
import "./updateComment.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateComment({ comment, setOpenUpdate }) {
  const [desc, setDesc] = useState(comment.desc);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedComment) =>
      makeRequest.put(`/comments/${comment.id}`, updatedComment),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", comment.postId]);
      toast.success("Comment updated.");
      setOpenUpdate(false); // Close form
    },

    onError: (error) => {
      toast.error("Error updating comment.");
      throw new Error(error);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if comment has been modified
    if (desc.trim() === comment.desc.trim()) {
      toast.info("No changes detected.");
      return;
    }

    const updatedComment = {
      ...comment,
      desc: desc.trim(),
    };

    updateMutation.mutate(updatedComment);
  };

  return (
    <>
      <div className="updateComment">
        <div className="wrapper">
          <h1>Update Your Comment</h1>

          <form name="update-comment-form">
            <textarea
              name="text"
              rows={5}
              placeholder="Write a text..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
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
