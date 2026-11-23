import cron from "node-cron";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const releaseExpiredReservations = async () => {
    const expiredOrders = await Order.find({
        paymentMethod: "ONLINE",
        paymentStatus: { $ne: "paid" },
        inventoryStatus: "reserved",
        reservationExpiresAt: { $lte: new Date() },
    });

    for (const expiredOrder of expiredOrders) {
        try {
            // First verify payment status with Razorpay.
            const paymentResponse = await razorpay.orders.fetchPayments(
                expiredOrder.razorpayOrderId
            );

            const payments = paymentResponse.items || [];

            // Never release stock if payment is captured or authorized.
            const paymentInProgress = payments.some(
                (payment) =>
                    payment.status === "captured" ||
                    payment.status === "authorized"
            );

            if (paymentInProgress) {
                continue;
            }

            // Restore stock and mark order released atomically.
            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    const order = await Order.findOneAndUpdate(
                        {
                            _id: expiredOrder._id,
                            paymentStatus: { $ne: "paid" },
                            inventoryStatus: "reserved",
                            reservationExpiresAt: { $lte: new Date() },
                        },
                        {
                            $set: {
                                inventoryStatus: "released",
                                paymentStatus: "failed",
                                orderStatus: "cancelled",
                            },
                        },
                        {
                            new: true,
                            session,
                        }
                    );

                    // Another request may already have handled this order.
                    if (!order) return;

                    for (const item of order.items) {
                        await Product.updateOne(
                            { _id: item.product },
                            {
                                $inc: { stock: item.quantity },
                            },
                            { session }
                        );
                    }
                });
            } finally {
                await session.endSession();
            }

        } catch (error) {
            // If Razorpay cannot confirm payment status,
            // do not release stock.
            console.error(
                `Reservation expiry failed for order ${expiredOrder._id}:`,
                error.message
            );
        }
    }
};

const startReservationExpiryJob = () => {
    // Run every minute.
    cron.schedule("* * * * *", async () => {
        try {
            await releaseExpiredReservations();
        } catch (error) {
            console.error("Reservation expiry job error:", error.message);
        }
    });

    console.log("Order reservation expiry job started.");
};

export default startReservationExpiryJob;