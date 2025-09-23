import { db, executeQuery } from "../db/connect.js";

export const getRelationships = async (req, res) => {
  const followerUserId = req.query.followedId;
  const q = "SELECT followerId FROM relationships WHERE followedId = ?";

  try {
    const data = await executeQuery(q, [followerUserId]);

    return res
      .status(200)
      .json(data.map((relationship) => relationship.followerId));
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching relationships.",
      error: error.message,
    });
  }
};

export const addRelationship = async (req, res) => {
  const loggedInUserId = req.user.id;
  const followedUserId = req.body.userId;

  const q =
    "INSERT INTO relationships(`followerId`, `followedId`) VALUES (?, ?)";
  const values = [loggedInUserId, followedUserId];

  try {
    await executeQuery(q, values);
    return res.status(201).json("User followed");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while creating relationship.",
      error: error.message,
    });
  }
};

export const deleteRelationship = async (req, res) => {
  const loggedInUserId = req.user.id;
  const followedUserId = req.query.userId;

  const q = "DELETE FROM relationships WHERE followerId = ? AND followedId = ?";

  try {
    const data = await executeQuery(q, [loggedInUserId, followedUserId]);
    if (data.affectedRows > 0) return res.status(200).json("User unfollowed");
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting relationship.",
      error: error.message,
    });
  }
};
