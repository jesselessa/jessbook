import { useState } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { makeRequest } from "../../utils/axios.js";

// Component
import Overlay from "../overlay/Overlay.jsx";

// Utility function checking if file is a video based on the name of its "type" attribute
const isVideo = (type) => type.startsWith("video/");

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

      return res.data; // image or video file sent to database
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

        setOpenCreateStory(false); // To close form
        toast.success("Story published.");
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

    mutation.mutate({ img: fileUrl, desc: desc }); // If success URL sent to database (stories table)
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Reset error message everytime file changes
    setError({ isError: false, message: "" });

    if (selectedFile) {
      // Check file type is a video
      if (isVideo(selectedFile.type)) {
        setFile(selectedFile);
        console.log(selectedFile);

        // Video duration
        // console.log("Video duration:", file.duration);
      } else {
        // File is an image
        setFile(selectedFile);
      }
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
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              Add an image or a video
            </label>

            {file && (
              <div className="img-container">
                {isVideo(file?.type) ? (
                  <video
                  // 'controls' and 'type' attributes not needed
                  >
                    <source
                      src={
                        URL.createObjectURL(file) // Creates a fake URL for file preview
                      }
                    />
                    Your browser doesn't support video.
                  </video>
                ) : (
                  <img alt="image" src={URL.createObjectURL(file)} />
                )}
              </div>
            )}
          </div>

          <textarea
            id="desc"
            name="desc"
            type="text"
            rows={3}
            placeholder="You can add a short description to your post."
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

      <Overlay />
    </div>
  );
}
