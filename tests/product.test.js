const request = require("supertest");
const app = require("../index");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const path = require("path");

let testProductId;

beforeAll(async () => {
  // Remove any existing test product with name "Test Product"
  await Product.deleteMany({ name: "Test Product" });
});

afterAll(async () => {
  // Clean up test product after tests
  if (testProductId) {
    await Product.findByIdAndDelete(testProductId);
  }
  await mongoose.disconnect();
});

describe("Product API", () => {
  test("should fail to create product with missing required fields", async () => {
    const res = await request(app)
      .post("/api/admin/product")
      .field("name", "Test Product")
      // missing price, categoryId, type, restaurantId
      // No file upload

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields: name, price, categoryId, type, restaurantId");
  });

  test("should create product successfully without file upload", async () => {
    const productData = {
      name: "Test Product",
      price: 100,
      categoryId: new mongoose.Types.ObjectId().toHexString(),
      type: "indian",
      restaurantId: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    const res = await request(app)
      .post("/api/admin/product")
      .field("name", productData.name)
      .field("price", productData.price)
      .field("categoryId", productData.categoryId)
      .field("type", productData.type)
      .field("restaurantId", productData.restaurantId)
      .field("userId", productData.userId)
      .attach("image", path.resolve(__dirname, "../uploads/image-46e363ef-8615-49d6-a3bd-153f5d5d3152.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product created successfully");
    expect(res.body.data).toMatchObject({
      name: productData.name,
      price: productData.price,
      type: productData.type,
    });

    testProductId = res.body.data._id;
  });

  test("should create product successfully with file upload", async () => {
    const productData = {
      name: "Test Product",
      price: 150,
      categoryId: new mongoose.Types.ObjectId().toHexString(),
      type: "nepali",
      restaurantId: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    const res = await request(app)
      .post("/api/admin/product")
      .field("name", productData.name)
      .field("price", productData.price)
      .field("categoryId", productData.categoryId)
      .field("type", productData.type)
      .field("restaurantId", productData.restaurantId)
      .field("userId", productData.userId)
      .attach("image", path.resolve(__dirname, "../uploads/image-46e363ef-8615-49d6-a3bd-153f5d5d3152.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product created successfully");
    expect(res.body.data).toHaveProperty("filepath");
    expect(res.body.data.name).toBe(productData.name);

    // Save for cleanup if needed
    if (!testProductId) {
      testProductId = res.body.data._id;
    }
  });

  test("should fetch products with pagination and search", async () => {
    const res = await request(app).get("/api/admin/product").query({
      page: 1,
      limit: 5,
      search: "Test",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 5);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should fetch products without filters", async () => {
    const res = await request(app).get("/api/admin/product");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
