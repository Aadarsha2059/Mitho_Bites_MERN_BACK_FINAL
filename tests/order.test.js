const request = require("supertest");
const app = require("../index");
const Order = require("../models/Order");
const mongoose = require("mongoose");

let testOrderId;

beforeAll(async () => {
  // Clean any existing test orders by user/product combination
  await Order.deleteMany({ quantity: 9999 });
});

afterAll(async () => {
  if (testOrderId) {
    await Order.findByIdAndDelete(testOrderId);
  }
  await mongoose.disconnect();
});

describe("Order API", () => {
  test("should fail to create order with missing required fields", async () => {
    const res = await request(app).post("/api/admin/order").send({
      productId: new mongoose.Types.ObjectId().toHexString(),
      // missing userId, quantity, price
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
  });

  test("should create order successfully", async () => {
    const orderData = {
      productId: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      quantity: 3,
      price: 100,
    };

    const res = await request(app).post("/api/admin/order").send(orderData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Order placed successfully");
    expect(res.body.data).toMatchObject({
      productId: orderData.productId,
      userId: orderData.userId,
      quantity: orderData.quantity,
      price: orderData.price,
      status: "Pending", // default status
    });

    testOrderId = res.body.data._id;
  });

  test("should fetch orders without filters", async () => {
    const res = await request(app).get("/api/admin/order");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 10);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should fetch orders with pagination and search", async () => {
    const res = await request(app)
      .get("/api/admin/order")
      .query({
        page: 1,
        limit: 5,
        search: "Pending",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // All returned orders should have status matching "Pending" (case insensitive)
    if (res.body.data.length > 0) {
      res.body.data.forEach((order) => {
        expect(order.status.toLowerCase()).toContain("pending");
      });
    }
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });
});
