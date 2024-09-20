// Utility function checking if file type is a video depending on its extension name
export const isVideo = (fileName) =>
  /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|m4v|ogv)$/.test(fileName);
