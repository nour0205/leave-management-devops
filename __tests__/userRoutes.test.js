const request = require("supertest");
const app = require("../index");

jest.mock("../dashboard/controllers/userController", () => ({
  getAllUsers: (req, res) => {
    res.status(200).json([{ id: "1", name: "Zied" }]);
  },
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("../dashboard/middleware/authMiddleware", () => ({
  verifyToken: (req, res, next) => next(),
  requireRole: (role) => (req, res, next) => next(),
}));

describe("GET /users", () => {
  it("should return a list of users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("id", "1");
    expect(res.body[0]).toHaveProperty("name", "Zied");
  });
});
