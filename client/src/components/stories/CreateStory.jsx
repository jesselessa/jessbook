import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import "./createStory.scss";

export default function CreateStory() {
  const [file, setFile] = useState(null);
  //   const [desc, setDesc] = useState("");
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

    let imgUrl, videoUrl;

    if (imgUrl === "" || videoUrl === "") {
      setError({
        isError: true,
        message: "You can't edit a story without an image or a video.",
      });
    } else {
      setFile(null);
      //   setDesc("");
      setError({ isError: false, message: "" });

      if (file) imgUrl = await upload();
      if (file) videoUrl = await upload();

      mutation.mutate({ image: imgUrl, video: videoUrl }); // If success URL sent to database (stories table)
    }
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
      <h1>Create a story</h1>

      {file && (
        <form>
          {/* Add an image or a video */}
          <div className="input-group">
            {/* input: file - value linked with state "file" doesn't work except if value equals "" or "null" */}
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label htmlFor="file">Add an image or a video</label>

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

          {/* <input
            type="text"
            placeholder="Add a short description."
            maxLength={100}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          /> */}
          <input type="submit" value="Publish" onClick={handleClick} />
        </form>
      )}

      {/* Error message */}
      {error.isError && <span className="errorMsg">{error.message}</span>}
    </div>
  );
}
