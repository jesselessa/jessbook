import { db } from "../utils/connect.js";

export const getRelationships = (req, res) => {
  const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";

  db.query(q, [req.query.followedUserId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res
      .status(200)
      .json(data.map((relationship) => relationship.followerUserId));
  });
};

export const addRelationship = (req, res) => {
  const q =
    "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";

  const values = [req.userInfo.id, req.body.userId];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Following");
  });
};

export const deleteRelationship = (req, res) => {
  const q =
    "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

  db.query(q, [req.userInfo.id, req.query.userId], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Unfollow");
  });
};
