import { db } from "../utils/connect.js";

export const getRelationships = (req, res) => {
  const followerUserId = req.query.followedId;
  const q = "SELECT followerId FROM relationships WHERE followedId = ?";

  db.query(q, [followerUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    return res
      .status(200)
      .json(data.map((relationship) => relationship.followerId));
  });
};

export const addRelationship = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const followedUserId = req.body.userId;

  const q = "INSERT INTO relationships(`followerId`, `followedId`) VALUES (?)";
  const values = [loggedInUserId, followedUserId];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("User followed.");
  });
};

export const deleteRelationship = (req, res) => {
  const loggedInUserId = req.userInfo.id;
  const followedUserId = req.query.userId;

  const q = "DELETE FROM relationships WHERE followerId = ? AND followedId = ?";

  db.query(q, [loggedInUserId, followedUserId], (error, data) => {
    if (error) return res.status(500).json(error);

    if (data.affectedRows > 0) return res.status(200).json("User unfollowed.");

    return res.status(403).json("You are not allowed to unfollow this user.");
  });
};
