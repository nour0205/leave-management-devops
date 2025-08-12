const request = require("supertest");
const app = require("../index");

// ✅ Mock auth to bypass JWT checks in tests
jest.mock("../dashboard/middleware/authMiddleware", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: "test-user", role: "manager", name: "Nour" }; // include name for review
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
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(), // used in getAllLeaveRequests for head_of_departement
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    attachment: {
      create: jest.fn(),
    },
  },
}));

const { prisma } = require("../prisma/prisma");

describe("Leave Request API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------
  // POST /api/leaves
  // ----------------------
  describe("POST /api/leaves", () => {
    it("should create a new leave request", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "123",
        role: "employee",
        managerId: "mgr-001",
        manager: { name: "Manager Name" },
      });

      const mockLeave = {
        id: "1",
        employeeId: "123",
        employeeName: "Zied",
        startDate: new Date("2025-08-01").toISOString(),
        endDate: new Date("2025-08-03").toISOString(),
        reason: "Vacation",
        status: "pending",
        reviewedById: "mgr-001",
        reviewedByName: "Manager Name",
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

  // ----------------------
  // PATCH /api/leaves/:id/review
  // ----------------------
  describe("PATCH /api/leaves/:id/review", () => {
    it("should review (approve) a leave request", async () => {
      prisma.leaveRequest.findUnique.mockResolvedValue({
        id: "1",
        status: "pending",
        employee: { managerId: "test-user" }, // reviewer matches
      });

      const mockReviewed = {
        id: "1",
        status: "approved",
        reviewedById: "test-user",
        reviewedByName: "Nour",
        reviewNotes: "Approved for 3 days",
        reviewedAt: new Date().toISOString(),
      };

      prisma.leaveRequest.update.mockResolvedValue(mockReviewed);

      const res = await request(app).patch("/api/leaves/1/review").send({
        status: "approved",
        reviewNotes: "Approved for 3 days",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("approved");
      expect(prisma.leaveRequest.update).toHaveBeenCalled();
    });

    it("should return 400 for invalid status", async () => {
      prisma.leaveRequest.findUnique.mockResolvedValue({
        id: "1",
        status: "pending",
        employee: { managerId: "test-user" },
      });

      const res = await request(app).patch("/api/leaves/1/review").send({
        status: "maybe",
        reviewNotes: "???",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid status");
    });
  });

  // ----------------------
  // GET /api/leaves
  // ----------------------
  describe("GET /api/leaves", () => {
    it("should return all leave requests for a manager", async () => {
      prisma.leaveRequest.findMany.mockResolvedValue([
        {
          id: "1",
          employeeName: "Zied",
          reason: "Vacation",
          status: "approved",
        },
        { id: "2", employeeName: "Nour", reason: "Medical", status: "pending" },
      ]);

      const res = await request(app).get("/api/leaves");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalled();
    });
  });
});
