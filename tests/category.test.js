const request = require("supertest");
const app = require("../index");
const Category = require("../models/foodCategory");
const mongoose = require("mongoose");
const path = require("path");

let testCategoryId;

beforeAll(async () => {
  // Clean up any existing test categories with this name before tests
  await Category.deleteMany({ name: "Test Category" });
});

afterAll(async () => {
  if (testCategoryId) {
    await Category.findByIdAndDelete(testCategoryId);
  }
  await mongoose.disconnect();
});

describe("Category API", () => {
  test("should create category without file upload", async () => {
    const res = await request(app)
      .post("/api/admin/category")
      .send({ name: "Test Category" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Created");
    expect(res.body.data).toHaveProperty("name", "Test Category");
    expect(res.body.data).not.toHaveProperty("filepath");

    testCategoryId = res.body.data._id;
  });

  test("should create category with file upload", async () => {
    const res = await request(app)
      .post("/api/admin/category")
      .field("name", "Test Category File")
      .attach("image", path.resolve(__dirname, "../uploads/image-46e363ef-8615-49d6-a3bd-153f5d5d3152.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Created");
    expect(res.body.data).toHaveProperty("name", "Test Category File");
    expect(res.body.data.filepath).toBeTruthy();

    // Clean up
    await Category.findByIdAndDelete(res.body.data._id);
  });

  test("should get all categories", async () => {
    const res = await request(app).get("/api/admin/category");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should get category by id", async () => {
    const res = await request(app).get(`/api/admin/category/${testCategoryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("name", "Test Category");
  });

  test("should return 404 for non-existent category id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/admin/category/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Category not found");
  });

  test("should update category without file upload", async () => {
    const res = await request(app)
      .put(`/api/admin/category/${testCategoryId}`)
      .send({ name: "Test Category Updated" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Updated");
    expect(res.body.data).toHaveProperty("name", "Test Category Updated");
  });

  test("should update category with file upload", async () => {
    const res = await request(app)
      .put(`/api/admin/category/${testCategoryId}`)
      .field("name", "Test Category Updated File")
      .attach("image", path.resolve(__dirname, "../uploads/image-46e363ef-8615-49d6-a3bd-153f5d5d3152.jpg"));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Updated");
    expect(res.body.data).toHaveProperty("name", "Test Category Updated File");
    expect(res.body.data.filepath).toBeTruthy();
  });

  test("should return 404 when updating non-existent category", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/category/${fakeId}`)
      .send({ name: "No Category" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Category not found");
  });

  test("should delete category", async () => {
    const res = await request(app).delete(`/api/admin/category/${testCategoryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category deleted");
  });

  test("should return 404 when deleting non-existent category", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/admin/category/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Category not found");
  });
});
