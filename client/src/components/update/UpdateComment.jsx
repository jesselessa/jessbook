import { useState } from "react";
import "./updateComment.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../utils/axios.jsx";
import { toast } from "react-toastify";

export default function UpdateComment({ comment, setOpenUpdate }) {
  const [desc, setDesc] = useState(comment.desc);

  console.log("Comment:", comment);

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (updatedComment) => {
      return makeRequest.put(`/comments/${comment.id}`, updatedComment);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);

        setOpenUpdate(false);
        toast.success("Comment updated.");
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if post has been modified
    if (desc.trim() === comment.desc.trim()) {
      toast.info("No changes detected.");
      return;
    }

    const updatedComment = {
      ...comment,
      desc: desc,
    };

    mutation.mutate(updatedComment);
  };

  return (
    <div className="updateComment">
      <div className="wrapper">
        <h1>Update Your Comment</h1>

        <form>
          <textarea
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button className="updateBtn" onClick={handleClick}>
            Update
          </button>
        </form>

        <button className="close" onClick={() => setOpenUpdate(false)}>
          X
        </button>
      </div>
    </div>
  );
}
