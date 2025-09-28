// Check is a file is an image or a video based on its extension

export const isImage = (fileName) => {
  return /\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff)$/i.test(fileName);
};

export const isVideo = (fileName) => {
  return /\.(mp4|mkv|webm|avi|mov|wmv|flv|m4v|3gp|mpeg|mpg|ogv|rm|rmvb|vob|mts|m2ts|ts|f4v|f4p|f4a|f4b)$/i.test(
    fileName
  );
};
