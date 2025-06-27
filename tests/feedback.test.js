const request = require("supertest");
const app = require("../index");
const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");

let testFeedbackId;

beforeAll(async () => {
  // Clean up any existing test feedbacks before tests
  await Feedback.deleteMany({ rating: 999 });
});

afterAll(async () => {
  if (testFeedbackId) {
    await Feedback.findByIdAndDelete(testFeedbackId);
  }
  await mongoose.disconnect();
});

describe("Feedback API", () => {
  test("should fail to create feedback with missing required fields", async () => {
    const res = await request(app).post("/api/admin/feedback").send({
      userId: new mongoose.Types.ObjectId().toHexString(),
      // missing productId, rating, comment
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
  });

  test("should create feedback successfully", async () => {
    const feedbackData = {
      userId: new mongoose.Types.ObjectId().toHexString(),
      productId: new mongoose.Types.ObjectId().toHexString(),
      rating: 4,
      comment: "Great product!",
    };

    const res = await request(app).post("/api/admin/feedback").send(feedbackData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Feedback submitted successfully");
    expect(res.body.data).toMatchObject(feedbackData);

    testFeedbackId = res.body.data._id;
  });

  test("should get all feedbacks", async () => {
    const res = await request(app).get("/api/admin/feedback");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page", 1);
    expect(res.body.pagination).toHaveProperty("limit", 10);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should get feedback by id", async () => {
    const res = await request(app).get(`/api/admin/feedback/${testFeedbackId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("rating", 4);
  });

  test("should return 404 for non-existent feedback id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/admin/feedback/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Feedback not found");
  });

  test("should update feedback", async () => {
    const res = await request(app)
      .put(`/api/admin/feedback/${testFeedbackId}`)
      .send({
        rating: 5,
        comment: "Excellent product!",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Feedback updated successfully");
    expect(res.body.data).toHaveProperty("rating", 5);
    expect(res.body.data).toHaveProperty("comment", "Excellent product!");
  });

  test("should return 404 when updating non-existent feedback", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/feedback/${fakeId}`)
      .send({
        rating: 3,
        comment: "Good product",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Feedback not found");
  });

  test("should fetch feedbacks with pagination and search", async () => {
    const res = await request(app)
      .get("/api/admin/feedback")
      .query({ page: 1, limit: 5, search: "Great" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  test("should delete feedback", async () => {
    const res = await request(app).delete(`/api/admin/feedback/${testFeedbackId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Feedback deleted successfully");
  });

  test("should return 404 when deleting non-existent feedback", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/admin/feedback/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Feedback not found");
  });
}); 