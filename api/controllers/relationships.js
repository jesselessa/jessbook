import { db } from "../utils/connect.js";

export const getRelationships = (req, res) => {
  const q = "SELECT followerId FROM relationships WHERE followedId = ?";

  db.query(q, [req.query.followedId], (error, data) => {
    if (error) return res.status(500).json(error);
    return res
      .status(200)
      .json(data.map((relationship) => relationship.followerId));
  });
};

export const addRelationship = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q = "INSERT INTO relationships (`followerId`,`followedId`) VALUES (?)";

  const values = [loggedInUserId, req.body.userId];

  db.query(q, [values], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Following");
  });
};

export const deleteRelationship = (req, res) => {
  const loggedInUserId = req.userInfo.id;

  const q =
    "DELETE FROM relationships WHERE `followerId` = ? AND `followedId` = ?";

  db.query(q, [loggedInUserId, req.query.userId], (error, _data) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json("Unfollow");
  });
};
