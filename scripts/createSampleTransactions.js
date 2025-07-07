const mongoose = require('mongoose');
const PaymentMethod = require('../models/paymentmethod');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mithobites', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const sampleTransactions = [
    {
        food: "Momo, Chowmein, Sel Roti",
        quantity: 3,
        totalprice: 450.00,
        paymentmode: "online",
        status: "completed",
        customerInfo: {
            name: "Ram Bahadur",
            phone: "+977-9841234567",
            address: "Thamel, Kathmandu"
        },
        orderId: "ORD-2024-001"
    },
    {
        food: "Dal Bhat, Chicken Curry",
        quantity: 2,
        totalprice: 320.00,
        paymentmode: "cod",
        status: "completed",
        customerInfo: {
            name: "Sita Devi",
            phone: "+977-9852345678",
            address: "Baneshwor, Kathmandu"
        },
        orderId: "ORD-2024-002"
    },
    {
        food: "Pizza Margherita, French Fries",
        quantity: 2,
        totalprice: 580.00,
        paymentmode: "esewa",
        status: "completed",
        customerInfo: {
            name: "Hari Kumar",
            phone: "+977-9863456789",
            address: "Lalitpur, Nepal"
        },
        orderId: "ORD-2024-003"
    },
    {
        food: "Burger, Coke, Fries",
        quantity: 3,
        totalprice: 420.00,
        paymentmode: "khalti",
        status: "completed",
        customerInfo: {
            name: "Gita Sharma",
            phone: "+977-9874567890",
            address: "Bhaktapur, Nepal"
        },
        orderId: "ORD-2024-004"
    },
    {
        food: "Thali Set, Lassi",
        quantity: 2,
        totalprice: 280.00,
        paymentmode: "cod",
        status: "completed",
        customerInfo: {
            name: "Bikash Thapa",
            phone: "+977-9885678901",
            address: "Pokhara, Nepal"
        },
        orderId: "ORD-2024-005"
    },
    {
        food: "Sushi Roll, Miso Soup",
        quantity: 2,
        totalprice: 650.00,
        paymentmode: "online",
        status: "completed",
        customerInfo: {
            name: "Anita Gurung",
            phone: "+977-9896789012",
            address: "Chitwan, Nepal"
        },
        orderId: "ORD-2024-006"
    },
    {
        food: "Pasta Carbonara, Garlic Bread",
        quantity: 2,
        totalprice: 380.00,
        paymentmode: "card",
        status: "completed",
        customerInfo: {
            name: "Rajesh Karki",
            phone: "+977-9807890123",
            address: "Dharan, Nepal"
        },
        orderId: "ORD-2024-007"
    },
    {
        food: "Fried Rice, Manchurian",
        quantity: 2,
        totalprice: 290.00,
        paymentmode: "cod",
        status: "pending",
        customerInfo: {
            name: "Laxmi Tamang",
            phone: "+977-9818901234",
            address: "Butwal, Nepal"
        },
        orderId: "ORD-2024-008"
    },
    {
        food: "Noodles, Spring Roll",
        quantity: 2,
        totalprice: 220.00,
        paymentmode: "esewa",
        status: "completed",
        customerInfo: {
            name: "Prakash Rai",
            phone: "+977-9829012345",
            address: "Biratnagar, Nepal"
        },
        orderId: "ORD-2024-009"
    },
    {
        food: "Sandwich, Coffee",
        quantity: 2,
        totalprice: 180.00,
        paymentmode: "khalti",
        status: "completed",
        customerInfo: {
            name: "Sunita Limbu",
            phone: "+977-9830123456",
            address: "Hetauda, Nepal"
        },
        orderId: "ORD-2024-010"
    }
];

const createSampleTransactions = async () => {
    try {
        // Clear existing transactions
        await PaymentMethod.deleteMany({});
        console.log('Cleared existing transactions');

        // Insert sample transactions
        const result = await PaymentMethod.insertMany(sampleTransactions);
        console.log(`Successfully created ${result.length} sample transactions`);

        // Display summary
        const totalRevenue = result.reduce((sum, transaction) => sum + transaction.totalprice, 0);
        console.log(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);

        const paymentModeStats = {};
        result.forEach(transaction => {
            const mode = transaction.paymentmode;
            if (!paymentModeStats[mode]) {
                paymentModeStats[mode] = { count: 0, total: 0 };
            }
            paymentModeStats[mode].count++;
            paymentModeStats[mode].total += transaction.totalprice;
        });

        console.log('\nPayment Mode Statistics:');
        Object.entries(paymentModeStats).forEach(([mode, stats]) => {
            console.log(`${mode.toUpperCase()}: ${stats.count} transactions, ₹${stats.total.toFixed(2)}`);
        });

        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error creating sample transactions:', error);
        mongoose.connection.close();
    }
};

createSampleTransactions(); 