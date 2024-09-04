import { useState } from "react";
import "./createStory.scss";
import { makeRequest } from "../../utils/axios.jsx";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export default function CreateStory({ setOpenCreateStory }) {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState({ isError: false, message: "" });

  // Handle image or video upload
  const upload = async () => {
    try {
      const formData = new FormData(); // File can't be directly sent to API
      formData.append("file", file);

      const res = await makeRequest.post("/uploads", formData);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  // Add a new story
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newStory) => {
      return makeRequest.post("/stories", newStory);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["stories"]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    // Check if image or video selected
    if (!file) {
      setError({
        isError: true,
        message: "You can't edit a story without an image or a video.",
      });
      return;
    }

    // Reset error message
    setError({ isError: false, message: "" });

    // Reset inputs after submission
    setFile(null);
    setDesc("");

    // Initialize variable, then, upload file and download URL
    let fileUrl = "";

    if (file) fileUrl = await upload();

    mutation.mutate({ img: fileUrl }); // If success URL sent to database (stories table)
  };

  // Delete a story
  const deleteMutation = useMutation(
    (storyId) => makeRequest.delete(`/stories/${storyId}`),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["stories"]);

        toast.success("Story deleted.");
      },
    }
  );

  const handleDelete = (story) => {
    try {
      deleteMutation.mutate(story.id);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  return (
    <div className="createStory">
      <div className="wrapper">
        <h1>Create a story</h1>

        <form>
          {/* Add an image or a video */}
          <div className="input-group">
            <label htmlFor="file">
              {/* input: file - value linked with state "file" doesn't work except if value equals "" or "null" */}
              <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              Add an image or a video
            </label>

            {file && (
              <div className="img-container">
                <img
                  className="file"
                  alt="story pic"
                  src={URL.createObjectURL(file)}
                  // This creates a fake URL so we can show our image
                />
              </div>
            )}
          </div>

          <textarea
            id="desc"
            name="desc"
            type="text"
            rows={3}
            placeholder="Add a short description."
            maxLength={100}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button type="submit" onClick={handleClick}>
            Publish
          </button>
        </form>

        {/* Error message */}
        {error.isError && <span className="errorMsg">{error.message}</span>}

        <button className="close" onClick={() => setOpenCreateStory(false)}>
          X
        </button>
      </div>
    </div>
  );
}
