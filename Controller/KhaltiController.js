// controllers/KhaltiController.js
const request = require('request');
const Payment = require("../Models/PaymentSchema");
const User = require("../Models/UserModel");

exports.initiatePayment = async (req, res) => {
    try {
        const {
            userId,
            amount,
            purchaseOrderName,
            customerName,
            customerEmail,
            customerPhone
        } = req.body;

        // Create a unique purchase order id incorporating the userId and timestamp.
        const purchaseOrderId = `Order_${userId}_${Date.now()}`;

        // Create a Payment record (initially 'pending')
        const newPayment = new Payment({
            user: userId,
            transactionId: purchaseOrderId,  // temporary until the real transaction ID is received
            amount: parseInt(amount, 10),
            status: 'pending'
        });
        await newPayment.save();

        // Set up options for the Khalti API request.
        const options = {
            method: 'POST',
            url: 'https://dev.khalti.com/api/v2/epayment/initiate/',
            headers: {
                // Use your test/live secret key as needed.
                'Authorization': 'key live_secret_key_68791341fdd94846a146f0457ff7b455',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                return_url: "http://192.168.101.6:8081/KhaltiStatusScreen", // This should match a valid frontend route
                website_url: "https://yourdomain.com",
                amount: amount,
                purchase_order_id: purchaseOrderId,
                purchase_order_name: purchaseOrderName || "Test Order",
                customer_info: {
                    name: customerName || "Guest",
                    email: customerEmail || "guest@example.com",
                    phone: customerPhone || "9800000000"
                }
            })
        };

        // Initiate the Khalti payment.
        request(options, (error, response, body) => {
            if (error) {
                console.error("Khalti Payment Initiation Error:", error);
                return res.status(500).json({ error: "Failed to initiate Khalti payment." });
            }
            try {
                const jsonResponse = JSON.parse(body);
                res.json(jsonResponse);
            } catch (err) {
                res.status(500).json({ error: "Invalid response from Khalti API" });
            }
        });
    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({ error: "Server error during payment initiation." });
    }
};

exports.handleReturn = async (req, res) => {
    try {
        // Expect payment details in query parameters.
        const { purchase_order_id, transaction_id, status, amount } = req.query;

        if (!purchase_order_id || !transaction_id || !status || !amount) {
            return res.status(400).json({ error: "Missing required payment parameters" });
        }

        // Find the Payment record created during payment initiation.
        let payment = await Payment.findOne({ transactionId: purchase_order_id });
        if (!payment) {
            return res.status(404).json({ error: "Payment record not found" });
        }

        // Update the payment with the actual transaction id and final status.
        payment.transactionId = transaction_id;
        payment.status = (status === "Completed") ? "success" : "failed";
        await payment.save();

        // If payment succeeded, update the user's payment history.
        if (status === "Completed") {
            await User.findByIdAndUpdate(payment.user, {
                paidAt: new Date(),
                roadmapAccess: true,
                $push: { paymentHistory: payment._id },
            });
        }

        return res.status(200).json({ message: "Payment status updated successfully." });
    } catch (error) {
        console.error("Error handling Khalti return:", error);
        return res.status(500).json({ error: "Internal server error while processing payment return." });
    }
};