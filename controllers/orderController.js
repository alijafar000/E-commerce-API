import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Create Order from Cart
export const createOrder = async (req, res) => {
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
            !fullName ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !postalCode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required shipping address fields",
            });
        }

        // 2. Find logged-in user's cart
        const cart = await Cart.findOne({
            user: req.user.userId,
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // 3. Prepare order items and calculate totals
        const orderItems = [];
        let subtotal = 0;
        let discount = 0;

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

            // 4. Validate stock
            if (item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available stock: ${product.stock}`,
                });
            }

            // 5. Calculate item price
            const itemSubtotal = product.price * item.quantity;

            const itemDiscount =
                (itemSubtotal * product.discount) / 100;

            const itemTotal = itemSubtotal - itemDiscount;

            subtotal += itemSubtotal;
            discount += itemDiscount;

            // 6. Save price snapshot
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemTotal,
            });
        }

        const total = subtotal - discount;

        // 7. Create order
        const order = await Order.create({
            user: req.user.userId,
            items: orderItems,
            shippingAddress: {
                fullName,
                phone,
                addressLine,
                city,
                state,
                postalCode,
                country: country || "India",
            },
            subtotal,
            discount,
            total,
            paymentMethod: "COD",
            paymentStatus: "pending",
            orderStatus: "pending",
        });

        // 8. Reduce product stock
        for (const item of cart.items) {
            const updatedProduct = await Product.findOneAndUpdate(
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

            // If stock changed while placing the order
            if (!updatedProduct) {
                // Remove the order because the full stock update failed
                await Order.findByIdAndDelete(order._id);

                return res.status(409).json({
                    success: false,
                    message: "Stock changed while placing your order. Please try again.",
                });
            }
        }

        // 9. Clear cart after successful order
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
        });
    }
};

//get all orders of logged-in user
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userId
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        })

    } catch (error) {
        console.log("Get my orders error:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your orders"
        })
    }
}

//get single order by id
export const getSingleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            })
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user.userId
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        return res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        console.log("Get single order error:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order"
        })
    }
}

//cancel order and restore product
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            })
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user.userId
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        //Allow cancellation for only for pending/confirm orders
        if (!["pending", "confirmed"].includes(order.orderStatus)) {
            return res.json({
                success: false,
                message: `Order can't be cancelled because your status is ${order.orderStatus}`
            })
        }

        //Restore stock for every product
        const restoredProducts = [];

        for (const item of order.items) {
            const product = await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: { stock: item.quantity },
                },
                { new: true }
            );

            if (!product) {
                // Roll back stock restorations already performed
                for (const restored of restoredProducts) {
                    await Product.findByIdAndUpdate(restored.productId, {
                        $inc: { stock: -restored.quantity },
                    });
                }

                return res.status(409).json({
                    success: false,
                    message:
                        "A product could not be found. Stock restoration was rolled back; order was not cancelled.",
                });
            }

            restoredProducts.push({
                productId: item.product,
                quantity: item.quantity,
            });
        }

        // 5. Mark order as cancelled
        order.orderStatus = "cancelled";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Cancel order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
        });
    }
}

//Admin: get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        })
    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all orders",
        });
    }
}

//Admin: update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {orderStatus} = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order id"
            })
        }

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
                allowedStatuses
            })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        //Prevent changes to final statuses
        if (["delivered", "cancelled"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Can't update an order that is already ${order.orderStatus}`
            })
        }

        //Prevent invalid backward transitions
        const statusFlow = {
            pending: ["confirmed"],
            confirmed: ["processing"],
            processing: ["shipped"],
            shipped: ["delivered"],
        };

        if (!statusFlow[order.orderStatus]?.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
    }

}