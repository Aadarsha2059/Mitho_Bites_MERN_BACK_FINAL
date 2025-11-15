# 🚀 Quick Start Guide - BHOKBHOJ

## ✅ Server is Running!

Your backend is now running on: **http://localhost:5050**

---

## 🔐 Admin Login Credentials

**Username:** `admin_aadarsha`  
**Password:** `admin_password`

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:5050`

### **Authentication:**
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Verify OTP: `POST /api/auth/verify-otp`

### **Public Endpoints:**
- Categories: `GET /api/categories`
- Products: `GET /api/products`
- Restaurants: `GET /api/restaurants`

### **Admin Panel:**
- Users: `/api/admin/users`
- Products: `/api/admin/product`
- Categories: `/api/admin/category`
- Orders: `/api/admin/order`
- Restaurants: `/api/admin/restaurant`

---

## 🎯 Frontend Configuration

Your frontend should connect to: **http://localhost:5050**

Make sure your frontend API base URL is set to:
```javascript
const API_BASE_URL = 'http://localhost:5050';
```

---

## 🔧 Server Commands

### **Start HTTP Server (Development):**
```bash
cd Backend
npm run dev
```

### **Start HTTPS Server (For Security Features):**
```bash
cd Backend
npm run dev:https
```

### **Stop Server:**
Press `Ctrl + C` in the terminal

---

## 📊 Database

**MongoDB URI:** `mongodb://localhost:27017/mithobites`

**Collections:**
- users
- products
- categories
- restaurants
- orders
- sessions
- audit_logs

---

## ✅ Everything is Working!

- ✅ Server running on port 5050
- ✅ MongoDB connected
- ✅ CORS enabled for http://localhost:5173
- ✅ Session management enabled
- ✅ Audit logging enabled
- ✅ All API endpoints active

---

## 🎨 Frontend

Your frontend should now be able to:
- Fetch categories
- Fetch products
- Login/Register
- Access admin panel with admin_aadarsha/admin_password

---

## 🆘 Troubleshooting

### **CORS Error:**
Make sure your frontend is running on `http://localhost:5173`

### **Connection Refused:**
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017/mithobites
```

### **Port Already in Use:**
Stop other servers or change PORT in `.env` file

---

**Your project is now fully functional!** 🎉
