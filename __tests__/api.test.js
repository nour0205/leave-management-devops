const request = require("supertest");
const app = require("../index");

describe("API Endpoints", () => {
  it("GET / should return Hello DevOps World!", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello DevOps World!");
  });
});
