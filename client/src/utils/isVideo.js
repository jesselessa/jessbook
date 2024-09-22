// Function checking if a file is a video based on its extension
const isVideo = (fileName) => {
  return /\.(mp4|mov|avi|mkv|flv|wmv|webm|mpeg|mpg|m4v)$/i.test(fileName);
};
