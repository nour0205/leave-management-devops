const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Role-Based Access Control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should block request with no token", async () => {
    const res = await request(app).get("/api/protected/admin-only");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Missing token");
  });

  it("should block request with invalid token", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const res = await request(app)
      .get("/api/protected/admin-only")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Invalid token");
  });

  it("should block access for non-admin user", async () => {
    jwt.verify.mockReturnValue({ userId: "123", role: "employee" });

    const res = await request(app)
      .get("/api/protected/admin-only")
      .set("Authorization", "Bearer validtoken");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Access denied");
  });

  it("should allow access for admin user", async () => {
    jwt.verify.mockReturnValue({ userId: "123", role: "admin" });

    const res = await request(app)
      .get("/api/protected/admin-only")
      .set("Authorization", "Bearer validtoken");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Welcome admin");
  });
});
