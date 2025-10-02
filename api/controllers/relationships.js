import { db, executeQuery } from "../db/connect.js";

//* ----------------------------
//* 1. Get followers of a user (who follows the targeted user ?)
//* ----------------------------
// Input  : req.query.followedId = ID of the user being followed
// Output : Array of IDs of users who follow the targeted user
//* ----------------------------
export const getFollowers = async (req, res) => {
  const followedUserId = req.query.followedId;
  const q = "SELECT followerId FROM relationships WHERE followedId = ?";

  try {
    const data = await executeQuery(q, [followedUserId]);

    // Return only the followers IDs as an array (*rel = relationship)
    return res.status(200).json(data.map((rel) => rel.followerId));
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching user's followers.",
      error: error.message,
    });
  }
};

//* ----------------------------
//* 2. Get following of a user (who does the targeted user follow ?)
//* ----------------------------
// Input  : req.query.followerId = ID of the user who follows
// Output : Array of IDs of users being followed by the targeted user
//* ----------------------------
export const getFollowing = async (req, res) => {
  const followerUserId = req.query.followerId;
  const q = "SELECT followedId FROM relationships WHERE followerId = ?";

  try {
    const data = await executeQuery(q, [followerUserId]);

    // Return only the followed IDs as an array
    return res.status(200).json(data.map((rel) => rel.followedId));
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while fetching user's following.",
      error: error.message,
    });
  }
};

//* ----------------------------
//* 3. Add a new relationship (follow someone)
//* ----------------------------
// Input  : req.user.id (from auth middleware) = logged-in user
//        : req.body.userId = ID of the user we want to follow
// Output : Success message if the relationship is created
//* -----------------------------
export const addRelationship = async (req, res) => {
  const followerUserId = req.user.id; // Logged-in user
  const followedUserId = req.body.userId; // The one being followed

  const q =
    "INSERT INTO relationships(`followerId`, `followedId`) VALUES (?, ?)";
  const values = [followerUserId, followedUserId];

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

//* ----------------------------
//* 4. Delete a relationship (unfollow someone)
//* ----------------------------
// Input  : req.user.id (from auth middleware) = logged-in user
//        : req.query.userId = ID of the user we want to unfollow
// Output : Success message if the relationship is deleted
//* -----------------------------
export const deleteRelationship = async (req, res) => {
  const followerUserId = req.user.id; // Logged-in user
  const followedUserId = req.query.userId; // The one being unfollowed

  const q = "DELETE FROM relationships WHERE followerId = ? AND followedId = ?";

  try {
    const data = await executeQuery(q, [followerUserId, followedUserId]);
    if (data.affectedRows > 0) return res.status(200).json("User unfollowed");
    return res.status(404).json({ message: "Relationship not found." });
  } catch (error) {
    return res.status(500).json({
      message: "An unknown error occurred while deleting relationship.",
      error: error.message,
    });
  }
};
