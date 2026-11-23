import crypto from "crypto";
import Razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const createRazorpayOrder = async (req, res) => {
    const userId = req.user.userId;

    let order = null;
    let reservedItems = [];
    let razorpayOrderCreated = false;

    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            postalCode,
            country,
        } = req.body;

        // 1. Validate shipping address
        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !postalCode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required shipping address fields",
            });
        }

        // 2. Get user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // 3. Validate products and calculate prices on server
        let subtotal = 0;
        let discount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findOne({
                _id: item.product,
                isActive: true,
            });

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products are unavailable",
                });
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > product.stock
            ) {
                return res.status(409).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            const itemSubtotal = product.price * item.quantity;
            const itemDiscount =
                (itemSubtotal * (product.discount || 0)) / 100;
            const itemTotal = itemSubtotal - itemDiscount;

            subtotal += itemSubtotal;
            discount += itemDiscount;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: Number(itemTotal.toFixed(2)),
            });
        }

        subtotal = Number(subtotal.toFixed(2));
        discount = Number(discount.toFixed(2));

        const total = Number((subtotal - discount).toFixed(2));

        if (!Number.isFinite(total) || total <= 0) {
            return res.status(400).json({
                success: false,
                message: "Order total must be greater than zero",
            });
        }

        // 4. Reserve stock atomically
        for (const item of cart.items) {
            const reservedProduct = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    isActive: true,
                    stock: { $gte: item.quantity },
                },
                {
                    $inc: { stock: -item.quantity },
                },
                {
                    new: true,
                }
            );

            if (!reservedProduct) {
                // Restore any stock reserved earlier in this request
                for (const reserved of reservedItems) {
                    await Product.updateOne(
                        { _id: reserved.productId },
                        { $inc: { stock: reserved.quantity } }
                    );
                }

                reservedItems = [];

                return res.status(409).json({
                    success: false,
                    message: "Stock changed during checkout. Please try again.",
                });
            }

            reservedItems.push({
                productId: item.product,
                quantity: item.quantity,
            });
        }

        // 5. Create MongoDB order
        order = await Order.create({
            user: userId,
            items: orderItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine: addressLine.trim(),
                city: city.trim(),
                state: state.trim(),
                postalCode: postalCode.trim(),
                country: country?.trim() || "India",
            },
            subtotal,
            discount,
            total,
            paymentMethod: "ONLINE",
            paymentStatus: "pending",
            orderStatus: "pending",

            inventoryStatus: "reserved",
            reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        // 6. Create Razorpay order
        const razorpayOrder = await Razorpay.orders.create({
            amount: Math.round(total * 100),
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                orderId: order._id.toString(),
                userId: userId.toString(),
            },
        });

        razorpayOrderCreated = true;

        // 7. Save Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // 8. Clear cart only after order creation succeeds
        // cart.items = [];
        // await cart.save();

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Create Razorpay order error:", error.message);

        // Do not delete an order or restore stock automatically after
        // Razorpay has created an order. Reconcile such failures manually.
        if (!razorpayOrderCreated) {
            if (order) {
                try {
                    await Order.findByIdAndDelete(order._id);
                } catch (cleanupError) {
                    console.error("Order cleanup failed:", cleanupError.message);
                }
            }

            for (const item of reservedItems) {
                try {
                    await Product.updateOne(
                        { _id: item.productId },
                        { $inc: { stock: item.quantity } }
                    );
                } catch (rollbackError) {
                    console.error("Stock rollback failed:", rollbackError.message);
                }
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order",
        });
    }
};



export const verifyRazorpayPayment = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // 1. Validate required payment details
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing Razorpay payment details",
            });
        }

        // 2. Find the order belonging to the logged-in user
        const order = await Order.findOne({
            user: userId,
            razorpayOrderId: razorpay_order_id,
            paymentMethod: "ONLINE",
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // 3. Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // 4. Keep verification idempotent
        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
            });
        }

        // 5. Save payment details
        // order.razorpayPaymentId = razorpay_payment_id;
        // order.paymentStatus = "paid";

        // if (order.orderStatus === "pending") {
        //     order.orderStatus = "confirmed";
        // }

        // await order.save();

        // return res.status(200).json({
        //     success: true,
        //     message: "Payment verified successfully",
        //     orderId: order._id,
        //     paymentStatus: order.paymentStatus,
        //     orderStatus: order.orderStatus,
        // });


        // Prevent duplicate payment verification
        if (order.inventoryStatus === "released") {
            return res.status(409).json({
                success: false,
                message: "Order inventory has already been released. Please contact support.",
            });
        }

        // Mark payment successful
        order.razorpayPaymentId = razorpay_payment_id;
        order.paymentStatus = "paid";
        order.inventoryStatus = "committed";

        if (order.orderStatus === "pending") {
            order.orderStatus = "confirmed";
        }

        await order.save();

        // Remove only the purchased quantities from cart
        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            for (const orderedItem of order.items) {
                const cartItem = cart.items.find(
                    (item) => item.product.toString() === orderedItem.product.toString()
                );

                if (cartItem) {
                    cartItem.quantity -= orderedItem.quantity;

                    if (cartItem.quantity <= 0) {
                        cart.items = cart.items.filter(
                            (item) => item.product.toString() !== orderedItem.product.toString()
                        );
                    }
                }
            }

            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order confirmed successfully",
            order,
        });
    } catch (error) {
        console.error(
            "Razorpay payment verification error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};