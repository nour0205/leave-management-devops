const request = require("supertest");
const app = require("../index");

// ✅ Mock auth to bypass JWT checks in tests
jest.mock("../dashboard/middleware/authMiddleware", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: "test-user", role: "manager" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

// ✅ Mock Prisma client
jest.mock("../prisma/prisma", () => ({
  prisma: {
    leaveRequest: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require("../prisma/prisma");

describe("Leave Request API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/leaves", () => {
    it("should create a new leave request", async () => {
      const mockLeave = {
        id: "1",
        employeeId: "123",
        employeeName: "Zied",
        startDate: "2025-08-01T00:00:00.000Z",
        endDate: "2025-08-03T00:00:00.000Z",
        reason: "Vacation",
        status: "pending",
      };

      prisma.leaveRequest.create.mockResolvedValue(mockLeave);

      const res = await request(app).post("/api/leaves").send({
        employeeId: "123",
        employeeName: "Zied",
        startDate: "2025-08-01",
        endDate: "2025-08-03",
        reason: "Vacation",
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(mockLeave);
      expect(prisma.leaveRequest.create).toHaveBeenCalled();
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/leaves").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("PATCH /api/leaves/:id/review", () => {
    it("should review (approve) a leave request", async () => {
      const mockReviewed = {
        id: "1",
        status: "approved",
        reviewedById: "admin123",
        reviewedByName: "Nour",
        reviewNotes: "Approved for 3 days",
        reviewedAt: new Date().toISOString(),
      };

      prisma.leaveRequest.update.mockResolvedValue(mockReviewed);

      const res = await request(app).patch("/api/leaves/1/review").send({
        status: "approved",
        reviewedById: "admin123",
        reviewedByName: "Nour",
        reviewNotes: "Approved for 3 days",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("approved");
      expect(prisma.leaveRequest.update).toHaveBeenCalled();
    });

    it("should return 400 for invalid status", async () => {
      const res = await request(app).patch("/api/leaves/1/review").send({
        status: "maybe",
        reviewedById: "admin123",
        reviewNotes: "???",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid status");
    });
  });

  describe("GET /api/leaves", () => {
    it("should return all leave requests", async () => {
      const mockData = [
        {
          id: "1",
          employeeName: "Zied",
          reason: "Vacation",
          status: "approved",
        },
        { id: "2", employeeName: "Nour", reason: "Medical", status: "pending" },
      ];

      prisma.leaveRequest.findMany.mockResolvedValue(mockData);

      const res = await request(app).get("/api/leaves");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalled();
    });
  });
});
