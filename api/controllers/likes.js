import { db, executeQuery } from "../utils/connect.js";

export const getLikes = async (req, res) => {
  const postId = req.query.postId;
  const q = "SELECT userId FROM likes WHERE postId = ?";

  try {
    const data = await executeQuery(q, [postId]);
    return res.status(200).json(data.map((like) => like.userId));
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching likes on post.",
      error: error.message,
    });
  }
};

export const addLike = async (req, res) => {
  const loggedInUserId = req.user.id;
  const postId = req.body.postId;

  const q = "INSERT INTO likes (`userId`, `postId`) VALUES (?, ?)";
  const values = [loggedInUserId, postId];

  try {
    const data = await executeQuery(q, values);
    if (data.affectedRows > 0) {
      return res.status(201).json("Post liked");
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while adding like on post.",
      error: error.message,
    });
  }
};

export const deleteLike = async (req, res) => {
  const loggedInUserId = req.user.id;
  const postId = req.query.postId;

  const q = "DELETE FROM likes WHERE userId = ? AND postId = ?";

  try {
    const data = await executeQuery(q, [loggedInUserId, postId]);
    if (data.affectedRows > 0) {
      return res.status(200).json("Post unliked");
    }
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting like on post.",
      error: error.message,
    });
  }
};
