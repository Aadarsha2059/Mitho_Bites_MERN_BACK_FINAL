const request = require("supertest");
const app = require("../index");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");
const path = require("path");

let testRestaurantId;

beforeAll(async () => {
  // Clean up test restaurant data before tests
  await Restaurant.deleteMany({ name: /Test Restaurant/i });
});

afterAll(async () => {
  if (testRestaurantId) {
    await Restaurant.findByIdAndDelete(testRestaurantId);
  }
  await mongoose.disconnect();
});

describe("Restaurant API", () => {
  test("should fail to create restaurant with missing required fields", async () => {
    const res = await request(app).post("/api/admin/restaurant").send({
      name: "Test Restaurant",
      location: "", // missing location
      contact: "1234567890",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
  });

  test("should create restaurant without file upload", async () => {
    const res = await request(app).post("/api/admin/restaurant").send({
      name: "Test Restaurant",
      location: "Test Location",
      contact: "1234567890",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Restaurant created successfully");
    expect(res.body.data).toHaveProperty("name", "Test Restaurant");
    expect(res.body.data).toHaveProperty("location", "Test Location");
    expect(res.body.data).toHaveProperty("contact", "1234567890");
    expect(res.body.data.filepath).toBeFalsy();

    testRestaurantId = res.body.data._id;
  });

  test("should create restaurant with file upload", async () => {
    const res = await request(app)
      .post("/api/admin/restaurant")
      .field("name", "Test Restaurant File")
      .field("location", "File Location")
      .field("contact", "0987654321")
      .attach("image", path.resolve(__dirname, "./test-files/sample-image.jpg"));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Restaurant created successfully");
    expect(res.body.data).toHaveProperty("name", "Test Restaurant File");
    expect(res.body.data.filepath).toBeTruthy();

    // Clean up this created restaurant
    await Restaurant.findByIdAndDelete(res.body.data._id);
  });

  test("should get restaurants without query params", async () => {
    const res = await request(app).get("/api/admin/restaurant");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 10);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should get restaurants with pagination and search", async () => {
    const res = await request(app)
      .get("/api/admin/restaurant")
      .query({ page: 1, limit: 5, search: "Test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((r) => {
      const match = [r.name, r.location, r.contact]
        .some((field) => field.toLowerCase().includes("test"));
      expect(match).toBe(true);
    });
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });
});
