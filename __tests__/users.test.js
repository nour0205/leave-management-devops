const request = require("supertest");
const app = require("../index");

jest.mock("../prisma/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require("../prisma/prisma");

// ✅ GET /api/users
describe("GET /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of users", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: "1", name: "Zied" },
      { id: "2", name: "Nour" },
    ]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toEqual({ id: "1", name: "Zied" });
    expect(prisma.user.findMany).toHaveBeenCalled();
  });
});

// ✅ GET /api/users/:id
describe("GET /api/users/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a user by ID", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "1", name: "Zied" });

    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "1", name: "Zied" });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
  });

  it("should return 404 if user not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "999" },
    });
  });
});
