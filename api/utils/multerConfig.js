import multer from "multer";

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, "../uploads"); //TODO - Check path !!!
  },
  filename: function (_req, file, callback) {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

export const upload = multer({ storage: storage }).single("image");
