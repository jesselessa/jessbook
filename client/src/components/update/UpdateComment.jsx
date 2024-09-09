import { useState } from "react";
import "./updateComment.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function UpdateComment({ comment, toggleUpdate }) {
  const [desc, setDesc] = useState(comment.desc);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updatedComment) =>
      makeRequest.put(`/comments/${comment.id}`, updatedComment),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", comment.postId]);

      toggleUpdate(); // Close form after submission
      toast.success("Comment updated.");
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if post has been modified
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

          <form>
            <textarea
              rows={5}
              placeholder="Write a text..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <button className="update-btn" onClick={handleClick}>
              Update
            </button>
          </form>

          <button className="close" onClick={toggleUpdate}>
            X
          </button>
        </div>
      </div>

      <Overlay />
    </>
  );
}
