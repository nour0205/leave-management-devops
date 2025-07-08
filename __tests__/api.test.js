const request = require("supertest");
const app = require("../index");

describe("API Endpoints", () => {
  it("GET / should return Hello DevOps World!", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello DevOps World!");
  });

  it("POST /api/items should create new item", async () => {
    const newItem = { name: "Test Item" };
    const res = await request(app).post("/api/items").send(newItem);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe(newItem.name);
  });
});
