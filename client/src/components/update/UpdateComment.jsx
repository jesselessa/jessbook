import { useState } from "react";
import "./updateComment.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Loader from "../loader/Loader.jsx";

export default function UpdateComment({ comment, setIsOpen }) {
  const [text, setText] = useState(comment.text);

  const queryClient = useQueryClient();

  // Optimistic mutation to update a comment
  const updateMutation = useMutation({
    mutationFn: (updatedComment) =>
      makeRequest.put(`/comments/${comment.id}`, updatedComment),

    onMutate: async (updatedComment) => {
      await queryClient.cancelQueries(["comments", comment.postId]);
      const previousComments = queryClient.getQueryData([
        "comments",
        comment.postId,
      ]);

      // Optimistic update: replace the old comment with the new one
      //! ⚠️ Reminder: Don't merge an uncomplete optimistic object (e.g., if we only return 'text', whereas 'comments' SQL table also contains other keys), in this case 'updatedComment', because it will overwrite our existing data => 💡 Only merge with the new one !!!

      queryClient.setQueryData(["comments", comment.postId], (oldData) =>
        oldData?.map((c) =>
          c.id === comment.id ? { ...c, text: updatedComment.text } : c
        )
      );

      return { previousComments };
    },

    onError: (error, _updatedComment, context) => {
      // if (import.meta.env.DEV) {
      //   console.error("Error updating comment:", error);
      // }
      console.error("Error updating comment:", error);

      toast.error("An error occured while updating comment.");

      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", comment.postId],
          context.previousComments
        );
      }
    },

    onSuccess: () => {
      toast.success("Comment updated.");
      setIsOpen(false);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["comments", comment.postId]);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text?.trim();

    // Check if comment has been modified
    if (trimmedText === comment.text.trimmed()) {
      toast.info("No changes detected.");
      return;
    }

    // Check comment length
    if (trimmedText?.length === 0) {
      toast.error("You must add a text to your comment.");
      return;
    }

    if (trimmedText?.length > 500) {
      toast.error("Your comment can't contain more than 500\u00A0characters.");
      return;
    }

    // Prepare updated data
    const updatedComment = {
      ...comment,
      text: trimmedText,
    };

    // Trigger mutation to update database
    updateMutation.mutate(updatedComment);
  };

  const isUpdating = updateMutation.isPending;

  return (
    <>
      <div className="updateComment">
        <div className="wrapper">
          <h1>Update Your Comment</h1>

          <form name="update-comment-form" onSubmit={handleSubmit}>
            <label htmlFor="text">Add a new text</label>
            <textarea
              id="text"
              name="text"
              rows={5}
              placeholder="Write a text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isUpdating}
            />

            <button type="submit" className="update-btn" disabled={isUpdating}>
              {isUpdating ? (
                <Loader
                  width="24px"
                  height="24px"
                  border="3px solid rgba(0, 0, 0, 0.1)"
                />
              ) : (
                "Update"
              )}
            </button>
          </form>

          <button
            type="button"
            className="close"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            X
          </button>
        </div>
      </div>
    </>
  );
}
