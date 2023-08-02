import { deletePost } from "../controllers/posts.js";

// Mock database to simulate requests
jest.mock("../utils/connect.js", () => ({
  db: {
    query: jest.fn(),
  },
}));

// Start test
describe("Test de la fonction de deletePost", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it("Devrait retourner une erreur 401 si aucun utilisateur n'est connecté", async () => {
    const req = { cookies: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith("User not logged in.");
  });

  // Test 2
  it("Devrait retourner une erreur 403 si l'utilisateur est connecté, mais n'est pas l'auteur de la publication", async () => {
    const req = { cookies: { accessToken: "invalidToken" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock of failed request with no affected row = user doesn't own post
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 0 });
    });

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith("Invalid token.");
  });

  // Test 3
  it("Devrait retourner une réponse avec statut 200 et message 'Post deleted.' si la suppression du post réussit", async () => {
    const req = { cookies: { accessToken: "validToken" }, params: { id: 123 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Mock of successful request with 1 row affected = user owns post
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("Post deleted.");
  });

  // Test 4
  it("Devrait retourner une erreur 500 si une erreur se produit dans la base de données", async () => {
    const req = { cookies: { accessToken: "validToken" }, params: { id: 123 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Mock of failed request because of error in database
    db.query.mockImplementation((query, values, callback) => {
      callback("Database error", null);
    });

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("An error occurred.");
  });
});
