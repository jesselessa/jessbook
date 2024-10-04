import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, path.join(__dirname, "../../client/dist/uploads"));
  },

  filename: function (_req, file, callback) {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});

// Initialize upload middleware
export const upload = multer({ storage: storage }).single("file");
