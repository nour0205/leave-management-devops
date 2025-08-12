const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

jest.mock("../prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"),
  verify: jest.fn(() => ({ id: "1", role: "employee", name: "Test User" })),
}));

const { prisma } = require("../prisma/prisma");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a JWT token and user on valid email", async () => {
    const mockUser = { id: "1", email: "zied@example.com", role: "employee" };

    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/login").send({
      email: "zied@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      token: "mocked-jwt-token",
      user: mockUser,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "zied@example.com" },
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "1", role: "employee" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  it("should return 401 if user not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid email");
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Email is required");
  });
});
