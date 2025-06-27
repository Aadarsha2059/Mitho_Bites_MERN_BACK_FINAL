const request = require("supertest");
const app = require("../index");
const PaymentMethod = require("../models/paymentmethod");
const mongoose = require("mongoose");

let testPaymentId;

beforeAll(async () => {
  // Clean up any existing test payments with this food name before tests
  await PaymentMethod.deleteMany({ food: "Test Food" });
});

afterAll(async () => {
  if (testPaymentId) {
    await PaymentMethod.findByIdAndDelete(testPaymentId);
  }
  await mongoose.disconnect();
});

describe("PaymentMethod API", () => {
  test("should fail to create payment method with missing required fields", async () => {
    const res = await request(app).post("/api/admin/paymentmethod").send({
      food: "Test Food",
      // missing quantity, totalprice, paymentmode
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
  });

  test("should create payment method successfully", async () => {
    const paymentData = {
      food: "Test Food",
      quantity: 2,
      totalprice: 500,
      paymentmode: "Cash",
    };

    const res = await request(app).post("/api/admin/paymentmethod").send(paymentData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Payment method created successfully");
    expect(res.body.data).toMatchObject(paymentData);

    testPaymentId = res.body.data._id;
  });

  test("should get all payment methods", async () => {
    const res = await request(app).get("/api/admin/paymentmethod");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 10);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should get payment method by id", async () => {
    const res = await request(app).get(`/api/admin/paymentmethod/${testPaymentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("food", "Test Food");
  });

  test("should return 404 for non-existent payment method id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/admin/paymentmethod/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Payment method not found");
  });

  test("should update payment method", async () => {
    const res = await request(app)
      .put(`/api/admin/paymentmethod/${testPaymentId}`)
      .send({
        food: "Test Food Updated",
        quantity: 3,
        totalprice: 750,
        paymentmode: "Card",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Payment method updated successfully");
    expect(res.body.data).toHaveProperty("food", "Test Food Updated");
    expect(res.body.data).toHaveProperty("quantity", 3);
    expect(res.body.data).toHaveProperty("totalprice", 750);
    expect(res.body.data).toHaveProperty("paymentmode", "Card");
  });

  test("should return 404 when updating non-existent payment method", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/paymentmethod/${fakeId}`)
      .send({
        food: "No Food",
        quantity: 1,
        totalprice: 100,
        paymentmode: "Cash",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Payment method not found");
  });

  test("should fetch payment methods with pagination and search", async () => {
    const res = await request(app)
      .get("/api/admin/paymentmethod")
      .query({ page: 1, limit: 5, search: "Test Food" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      res.body.data.forEach((payment) => {
        expect(payment.food).toMatch(/Test Food/i);
      });
    }
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  test("should delete payment method", async () => {
    const res = await request(app).delete(`/api/admin/paymentmethod/${testPaymentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Payment method deleted successfully");
  });

  test("should return 404 when deleting non-existent payment method", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/admin/paymentmethod/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Payment method not found");
  });
}); 