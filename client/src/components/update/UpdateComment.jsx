import { useState } from "react";
import "./updateComment.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.js";
import { toast } from "react-toastify";

// Component
import Loader from "../loader/Loader.jsx";

export default function UpdateComment({ comment, setIsOpen }) {
  const [text, setText] = useState(comment.text);
  const [error, setError] = useState({ isError: false, message: "" });

  const queryClient = useQueryClient();

  // Optimistic mutation to update a comment
  const updateMutation = useMutation({
    mutationFn: async ({ text }) =>
      await makeRequest.put(`/comments/${comment.id}`, { text }),

    onMutate: async ({ text }) => {
      await queryClient.cancelQueries(["comments", comment.postId]);

      const previousComments =
        queryClient.getQueryData(["comments", comment.postId]) || [];

      const optimisticComment = {
        ...comment,
        text,
      };

      queryClient.setQueryData(
        ["comments", comment.postId],
        (oldComments = []) =>
          oldComments?.map((c) => (c.id === comment.id ? optimisticComment : c))
      );

      return { previousComments };
    },

    onError: (error, _variables, context) => {
      console.error(error);
      setError({
        isError: true,
        message: error.response?.data?.message || error.message,
      });

      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", comment.postId],
          context.previousComments
        );
      }
    },

    onSuccess: () => {
      toast.success("Comment updated.");
      setError({ isError: false, message: "" });
      setIsOpen(false);
    },

    onSettled: () =>
      queryClient.invalidateQueries(["comments", comment.postId]),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text?.trim();

    // Check if comment has been modified
    if (trimmedText === comment.text.trim()) {
      toast.info("No changes detected.");
      return;
    }

    // Check comment length
    if (trimmedText?.length === 0) {
      setError({
        isError: true,
        message: "You must add a text to your comment.",
      });
      return;
    }

    if (trimmedText?.length > 500) {
      setError({
        isError: true,
        message: "Your comment can't contain more than 500\u00A0characters.",
      });
      return;
    }

    // Prepare updated data
    const updatedComment = {
      text: trimmedText,
    };

    // Trigger mutation to update database
    updateMutation.mutate(updatedComment);
  };

  const isUpdating = updateMutation.isPending;

  // Handle inputs changes
  const handleChange = (e) => {
    setError({ isError: false, message: "" }); // Reset previous error mesage
    setText(e.target.value);
  };

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
              onChange={handleChange}
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

          {/* Display error message */}
          {error.isError && <div className="error-msg">{error.message}</div>}

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
