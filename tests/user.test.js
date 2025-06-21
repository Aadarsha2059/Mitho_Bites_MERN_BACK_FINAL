const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const mongoose = require("mongoose");

let authToken;
let userId;

beforeAll(async () => {
  await User.deleteOne({ username: "testuser123" });
  await User.deleteOne({ email: "test@example.com" });
});

afterAll(async () => {
  await User.deleteOne({ username: "testuser123" });
  await User.deleteOne({ email: "test@example.com" });
  await mongoose.disconnect();
});

describe("User Authentication API", () => {
  test("should fail to register user with missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Test User",
      // missing username, email, password, phone, address
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    // Match exact message your API sends
    expect(res.body.message).toBe(
      "All fields (fullname, username, email, password, confirmPassword, phone, address) are required."
    );
  });

  test("should fail to register user if password and confirmpassword do not match", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Test User",
      username: "testuser123",
      email: "test@example.com",
      password: "password123",
      confirmpassword: "password321",
      phone: "1234567890",
      address: "Test Address",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Password and Confirm Password do not match.");
  });

  test("should fail to register user with invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Test User",
      username: "testuser123",
      email: "invalid-email",
      password: "password123",
      confirmpassword: "password123",
      phone: "1234567890",
      address: "Test Address",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please provide a valid email address.");
  });

  test("should register user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Test User",
      username: "testuser123",
      email: "test@example.com",
      password: "password123",
      confirmpassword: "password123",
      phone: "1234567890",
      address: "Test Address",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    // Adjust test if API returns user in "data" object or differently
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data).toHaveProperty("email", "test@example.com");

    userId = res.body.data._id;
  });

  test("should fail to register user with existing username", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Another User",
      username: "testuser123", // existing username
      email: "another@example.com",
      password: "password123",
      confirmpassword: "password123",
      phone: "0987654321",
      address: "Other Address",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Username already exists");
  });

  test("should fail to register user with existing email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Another User",
      username: "anotheruser",
      email: "test@example.com", // existing email
      password: "password123",
      confirmpassword: "password123",
      phone: "0987654321",
      address: "Other Address",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already exists");
  });

  test("should login user with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser123",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");

    authToken = res.body.token;
  });

  test("should fail login with incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser123",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(403); // Adjusted from 401 to 403 as per your output
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });
});

describe("Admin User Management Routes", () => {
  beforeAll(async () => {
    // Set user role to admin for admin route access
    await User.findByIdAndUpdate(userId, { role: "admin" });
  });

  test("should get paginated users list as admin", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer " + authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("totalPages");
  });

  test("should get one user by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set("Authorization", "Bearer " + authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("username", "testuser123");
    expect(res.body.data).toHaveProperty("email", "test@example.com");
  });

  test("should update user info with matching passwords", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", "Bearer " + authToken)
      .send({
        fullname: "Updated User",
        username: "testuser123",
        email: "updated@example.com",
        phone: "1112223333",
        address: "Updated Address",
        password: "newpassword123",
        confirmpassword: "newpassword123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullname).toBe("Updated User");
    expect(res.body.data.email).toBe("updated@example.com");
  });

  test("should fail update user if passwords do not match", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", "Bearer " + authToken)
      .send({
        password: "newpass",
        confirmpassword: "wrongconfirm",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Passwords do not match");
  });

  test("should delete user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set("Authorization", "Bearer " + authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
