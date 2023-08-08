import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, "../client/uploads");
  },
  filename: function (_req, file, callback) {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});

export const upload = multer({ storage: storage }).single("file");
