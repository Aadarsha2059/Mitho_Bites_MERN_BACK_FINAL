const request = require("supertest");
const app = require("../index");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");

let testCartId;

beforeAll(async () => {
  // Clean up any existing test cart items before tests
  await Cart.deleteMany({ quantity: 999 });
});

afterAll(async () => {
  if (testCartId) {
    await Cart.findByIdAndDelete(testCartId);
  }
  await mongoose.disconnect();
});

describe("Cart API", () => {
  test("should fail to create cart item with missing required fields", async () => {
    const res = await request(app).post("/api/admin/cart").send({
      userId: new mongoose.Types.ObjectId().toHexString(),
      // missing productId, quantity, price
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
  });

  test("should create cart item successfully", async () => {
    const cartData = {
      userId: new mongoose.Types.ObjectId().toHexString(),
      productId: new mongoose.Types.ObjectId().toHexString(),
      quantity: 2,
      price: 150,
    };

    const res = await request(app).post("/api/admin/cart").send(cartData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cart item added successfully");
    expect(res.body.data).toMatchObject(cartData);

    testCartId = res.body.data._id;
  });

  test("should get all cart items", async () => {
    const res = await request(app).get("/api/admin/cart");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 10);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should get cart item by id", async () => {
    const res = await request(app).get(`/api/admin/cart/${testCartId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("quantity", 2);
  });

  test("should return 404 for non-existent cart item id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/admin/cart/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cart item not found");
  });

  test("should update cart item", async () => {
    const res = await request(app)
      .put(`/api/admin/cart/${testCartId}`)
      .send({
        quantity: 3,
        price: 200,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cart item updated successfully");
    expect(res.body.data).toHaveProperty("quantity", 3);
    expect(res.body.data).toHaveProperty("price", 200);
  });

  test("should return 404 when updating non-existent cart item", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/cart/${fakeId}`)
      .send({
        quantity: 1,
        price: 100,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cart item not found");
  });

  test("should fetch cart items with pagination and search", async () => {
    const res = await request(app)
      .get("/api/admin/cart")
      .query({ page: 1, limit: 5, search: "test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  test("should delete cart item", async () => {
    const res = await request(app).delete(`/api/admin/cart/${testCartId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Cart item deleted successfully");
  });

  test("should return 404 when deleting non-existent cart item", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/admin/cart/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cart item not found");
  });
}); 