import { useState } from "react";
import "./createStory.scss";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { uploadFile } from "../../utils/uploadFile.js";
import { isVideo } from "../../utils/isVideo.js";
import { toast } from "react-toastify";

// Component
import Overlay from "../overlay/Overlay.jsx";

export default function CreateStory({ setOpenCreateStory }) {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState({ isError: false, message: "" });

  // Add a new story
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newStory) => {
      return makeRequest.post("/stories", newStory);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
        setOpenCreateStory(false);
        toast.success("Story published.");
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    if (!image && !video) {
      setError({
        isError: true,
        message: "You must upload either an image or a video.",
      });

      setTimeout(() => {
        setError({ isError: false, message: "" });
      }, 3000);
      return;
    }

    let imageUrl = "";
    let videoUrl = "";
    try {
      if (image) {
        imageUrl = await uploadFile(image);
        mutation.mutate({ img: imageUrl, desc: desc });
      } else if (video) {
        videoUrl = await uploadFile(video);
        mutation.mutate({ img: videoUrl, desc: desc });
      }
      // mutation.mutate({ img: fileUrl, desc: desc });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (isVideo(selectedFile.type)) {
      setVideo(selectedFile);
      videoUrl = URL.createObjectURL(selectedFile);
      setImage(null);
      imageUrl = "";
    } else {
      setImage(selectedFile);
      imageUrl = URL.createObjectURL(selectedFile);
      setVideo(null);
      videoUrl = "";
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
              <input
                type="file"
                name="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              Add an image or a video
            </label>

            {/* Display preview of the selected file */}
            <div className="img-container">
              {image && <img src={imageUrl} alt="story preview" />}
              {video && <video src={videoUrl} type={video.type} />}
            </div>
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
        {error.isError && <span className="error-msg">{error.message}</span>}

        <button className="close" onClick={() => setOpenCreateStory(false)}>
          X
        </button>
      </div>

      <Overlay />
    </div>
  );
}
