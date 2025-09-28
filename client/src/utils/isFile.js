//******************************* isFile.js **********************************
// Utility functions for file type checking (image, video)
//****************************************************************************

// Check if a file is an image based on its extension
export const isImage = (fileName) => {
  return /\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff)$/i.test(fileName);
};

// Check if a file is a video based on its extension
export const isVideo = (fileName) => {
  return /\.(mp4|mkv|webm|avi|mov|wmv|flv|m4v|3gp|mpeg|mpg|ogv|rm|rmvb|vob|mts|m2ts|ts|f4v|f4p|f4a|f4b)$/i.test(
    fileName
  );
};

// Determine the correct MIME type for the video source
//! ⚠️ Crucial for cross-browser compatibility, especially for .MOV files
export const getMimeType = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  // Use video/mp4 for .mov files, which is a widely supported format and often matches the codec used by modern iOS devices (H.264/AAC)
  if (extension === "mov") return "video/mp4";

  // For other known types, default to the generic video/extension format
  return `video/${extension}`;
};
