import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, path.join(__dirname, "../../client/public/uploads"));
  },

  filename: function (_req, file, callback) {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});

// Initialize upload middleware
export const upload = multer({ storage: storage }).single("file");
