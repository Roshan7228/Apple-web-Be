
const Ordermodel = require("../Model/OrderModel");
const ProductModel = require("../Model/ProductModel");
const razorpay = require("../Util/razorpay");
require("dotenv").config();
const crypto = require("crypto");

let Ordercontroller = {
    Orderplace: async (req, res) => {
        const { userid, pid } = req.params;
        const { selectedColor, quantity } = req.body;

        if (!userid || !pid)
            return res.status(400).json({ message: "Missing user or product id" });

        if (req.User._id != userid) {
            return res.status(403).json({ message: "Unauthorized user" });
        }

        try {
            const product = await ProductModel.findById(pid);
            if (!product)
                return res.status(404).json({ message: "Product not found" });

            let parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                parsedQuantity = 1;
            }
            const productPriceTotal = product.Price * parsedQuantity;

            // Find only pending orders (Unpaid orders)
            let order = await Ordermodel.findOne({ userid, orderStatus: "Pending" });

            // Agar order hai lekin payment complete ya processing me hai, to naya order create karenge
            if (order && order.paymentStatus !== "Pending") {
                order = null;
            }

            if (order) {
                const productIndex = order.Products.findIndex(
                    (p) => p.productId.toString() === pid.toString()
                );

                if (productIndex > -1) {
                    // Product already hai, quantity update karo aur price recalc karo
                    order.Products[productIndex].quantity = parsedQuantity;
                    order.Products[productIndex].selectedPrice = parsedQuantity * product.Price;

                    if (selectedColor) {
                        order.Products[productIndex].selectedColor = selectedColor;
                    }

                    // Totalamount recalc only valid (non-cancelled) products ke liye
                    order.Totalamount = order.Products
                        .filter(item => !item.cancelRequest?.isRequested && !item.isCancelled)
                        .reduce((acc, item) => acc + item.selectedPrice, 0);

                    await order.save();
                    return res
                        .status(200)
                        .json({ message: "Order updated successfully", order });
                }

                // Product order me nahi hai, naya product add karo
                order.Products.push({
                    productId: pid,
                    name: product.name,
                    model: product.model,
                    category: product.category,
                    quantity: parsedQuantity,
                    selectedColor,
                    selectedStorage: product.space?.storage || null,
                    selectedPrice: productPriceTotal,
                    productimage: product.image[0],
                });

                order.Totalamount = order.Products
                    .filter(item => !item.cancelRequest?.isRequested && !item.isCancelled)
                    .reduce((acc, item) => acc + item.selectedPrice, 0);

                await order.save();
                return res
                    .status(200)
                    .json({ message: "Order updated successfully with new product", order });
            }

            // Koi pending unpaid order nahi mila, to naya order create karo
            const newOrder = await Ordermodel.create({
                userid,
                Products: [
                    {
                        productId: pid,
                        name: product.name,
                        model: product.model,
                        category: product.category,
                        quantity: parsedQuantity,
                        selectedColor,
                        selectedStorage: product.space?.storage || null,
                        selectedPrice: productPriceTotal,
                        productimage: product.image[0],
                    },
                ],
                Totalamount: productPriceTotal,
                orderStatus: "Pending",
                paymentStatus: "Pending",
            });

            return res
                .status(201)
                .json({ message: "Order created successfully", order: newOrder });

        } catch (error) {
            return res.status(500).json({
                message:error.message
            });
        }
    },
    Orderpost: async (req, res) => {
        const { userid } = req.params;
        const { ShippingAddress, paymentMethods } = req.body;
        if(!ShippingAddress ||!paymentMethods){
            return res.status(400).json({
                message:"Please fill the feilds."
            })
        }

        if (!userid) return res.status(400).json({ message: "Missing user id" });
        if (req.User._id !== userid) return res.status(403).json({ message: "Unauthorized user" });

        try {
            let order = await Ordermodel.findOne({ userid, orderStatus: "Pending" });
            if (!order) return res.status(404).json({ message: "No pending order found" });

            if (ShippingAddress) order.ShippingAddress = ShippingAddress;
            if (paymentMethods) order.paymentMethod = paymentMethods;

            // Recalculate total amount for only valid (non-cancelled) products
            order.Totalamount = order.Products
                .filter(item => !item.cancelRequest?.isRequested && !item.isCancelled)
                .reduce((acc, item) => acc + item.selectedPrice, 0);


            await order.save();

            return res.status(200).json({ message: "Order finalized successfully", order });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    TotalOrder: async (request, response) => {
        const { userid } = request.params;

        if (request.User._id !== userid) {
            return response.status(403).json({ message: "Not Allowed: Unauthorized user" });
        }

        try {
            let Totalorder = await Ordermodel.find({ userid });

            if (Totalorder.length === 0) {
                return response.status(404).json({
                    message: "No orders found"
                });
            }

            let filteredOrders = Totalorder.map(order => {
                let validProducts = order.Products.filter(
                    (item) => !item.cancelRequest?.isRequested && !item.isCancelled
                );
                return {
                    ...order._doc,
                    Products: validProducts
                };
            });

            let totalProducts = filteredOrders.reduce((sum, order) => sum + order.Products.length, 0);

            return response.status(200).json({
                message: "All Order Products (excluding cancel requested)",
                total: totalProducts,
                Totalorder: filteredOrders
            });

        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },
    GetSubtotal: async (req, res) => {
        const { userid } = req.params;

        if (req.User._id !== userid) {
            return res.status(403).json({ message: "Unauthorized user" });
        }

        try {
            // User ke sabhi orders jinka status Pending aur paymentPending ho
            const orders = await Ordermodel.find({
                userid,
                orderStatus: "Pending",
                paymentStatus: "Pending"
            });

            if (!orders || orders.length === 0) {
                return res.status(200).json({
                    message: "No pending orders with unpaid status found",
                    subtotal: 0,
                    Products: []
                });
            }

            // Sabhi orders ke valid products ko ek array me collect karo
            let allValidProducts = [];

            orders.forEach(order => {
                const validProducts = order.Products.filter(
                    (item) => !item.cancelRequest?.isRequested && !item.isCancelled
                );
                allValidProducts = allValidProducts.concat(validProducts);
            });

            // Subtotal nikal lo sabhi valid products ka
            const subtotal = allValidProducts.reduce((acc, item) => acc + item.selectedPrice, 0);

            return res.status(200).json({
                message: "Subtotal fetched successfully from all pending unpaid orders",
                subtotal,
                Products: allValidProducts
            });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    Orderdelete: async (request, response) => {
        let { userid, orderid, pid } = request.params;

        if (request.User._id !== userid) {
            return response.status(403).json({ message: "Not Authorized" });
        }

        try {
            let order = await Ordermodel.findOne({ _id: orderid, userid });
            if (!order) {
                return response.status(404).json({ message: "Order not found" });
            }
            if (order.orderStatus === "Pending") {
                const productIndex = order.Products.findIndex(
                    (item) => item.productId.toString() === pid
                );
                if (productIndex === -1) {
                    return response.status(404).json({ message: "Product not found in order" });
                }
                const removedProductPrice = order.Products[productIndex].selectedPrice;
                order.Totalamount -= removedProductPrice;
                order.Products.splice(productIndex, 1);
                await order.save();
                return response.status(200).json({
                    message: "Product removed successfully from order",
                    order
                });
            } else {
                return response.status(400).json({ message: "Order already confirmed. Cannot modify." });
            }

        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },
    CancelRequestByUser: async (request, response) => {
        let { userid, orderid, pid } = request.params;
        let { reason } = request.body;

        if (!reason) {
            return response.status(400).json({ message: "Cancel reason is required" });
        }

        if (request.User._id !== userid) {
            return response.status(403).json({ message: "Not Authorized" });
        }

        try {
            let order = await Ordermodel.findOne({ _id: orderid, userid });

            if (!order) {
                return response.status(404).json({ message: "Order not found" });
            }

            let product = order.Products.find(p => p.productId === pid);
            if (!product) {
                return response.status(404).json({ message: "Product not found in this order" });
            }

            if (product.cancelRequest.isRequested) {
                return response.status(400).json({ message: "Cancel request already sent for this product" });
            }

            product.cancelRequest = {
                isRequested: true,
                reason,
                requestedAt: new Date()
            };

            await order.save();

            return response.status(200).json({
                message: "Cancel request sent successfully",
                order
            });

        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    AdminApproveCancel: async (request, response) => {
        let { orderid, pid } = request.params;

        try {
            let order = await Ordermodel.findById(orderid);
            if (!order) {
                return response.status(404).json({ message: "Order not found" });
            }

            let product = order.Products.find(p => p.productId === pid);
            if (!product) {
                return response.status(404).json({ message: "Product not found in this order" });
            }

            if (!product.cancelRequest.isRequested) {
                return response.status(400).json({ message: "No cancel request for this product" });
            }

            product.isCancelled = true;
            product.cancelRequest.isRequested = true
            product.cancelledAt = new Date();

            order.Totalamount -= product.selectedPrice;

            await order.save();

            return response.status(200).json({
                message: "Product cancel request approved by Admin",
            });

        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    GetAllCancelRequests: async (request, response) => {
        try {
            const orders = await Ordermodel.find();

            const filteredOrders = orders.map(order => {
                const requestedProducts = order.Products.filter(p => p.cancelRequest?.isRequested === true);

                return {
                    orderId: order._id,
                    userId: order.userid,
                    requestedProducts
                };
            }).filter(item => item.requestedProducts.length > 0);

            if (filteredOrders.length === 0) {
                return response.status(404).json({
                    message: "No cancel requests found"
                });
            }

            return response.status(200).json({
                message: "Cancel requests found",
                data: filteredOrders
            });

        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },
    GetAllOrderbyAdmin: async (request, response) => {
        let { userid } = request.params;
        if (!userid) {
            return response.status(400).json({
                message: "Order Cancelled: Missing user"
            })
        }
        if (request.User._id !== userid) {
            return response.status(400).json({
                message: "Not Access"
            })
        }
        try {
            let order = await Ordermodel.find();
            if (!order) {
                return response.status(400).json({
                    message: "Order Not Found"
                })
            }
            let onlyConfirmOrder = order.flatMap((item) =>
                item.Products.filter((product) => product.isCancelled === false)
            );
            return response.status(200).json({
                orderproduct: onlyConfirmOrder
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    InitiatePayment: async (request, response) => {
        let { userid, orderid } = request.params;
        try {

            const order = await Ordermodel.findById(orderid);
            if (!order || request.User._id !== userid) {
                return response.status(400).json({
                    message: "Order not found or Unauthorized"
                })
            }

            const options = {
                amount: order.Totalamount*100,
                currency: "INR",
                receipt: `receipt_order_${orderid}`
            }

            const razorpayOrder = await razorpay.orders.create(options);
            order.razorpayOrderId = razorpayOrder.id;
            await order.save();

            return response.status(200).json({
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            });
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    verifyPayment: async (request, response) => {
        let { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

        try {
            if (expectedSignature === razorpay_signature) {
                const order = await Ordermodel.findOne({ razorpayOrderId: razorpay_order_id });
                if (!order) {
                    return response.status(400).json({
                        message: "Order Not Found"
                    });
                }
                order.razorpayPaymentId = razorpay_payment_id;
                order.razorpaySignature = razorpay_signature;
                order.paymentStatus = "Paid";
                order.orderStatus = "Confirmed";
                await order.save();
                return response.status(200).json({ message: "Payment Verified", order });
            } else {
                const order = await Ordermodel.findOne({ razorpayOrderId: razorpay_order_id });
                if (order) {
                    order.paymentStatus = "Failed";
                    order.orderStatus = "Pending";
                    await order.save();
                }
                return response.status(400).json({ message: "Payment Failed" });
            }
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    }



};

module.exports = Ordercontroller;
