import { Request, Response } from 'express';
// @ts-ignore
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel';
import Product from '../models/productModel';
import crypto from 'crypto';

// Helper to calculate weight in KG
const getWeightInKg = (weight: string): number => {
    const w = weight.toLowerCase();
    if (w.includes('kg')) {
        return parseFloat(w.replace('kg', ''));
    } else if (w.includes('g')) {
        return parseFloat(w.replace('g', '')) / 1000;
    }
    return 0.2; // Default fallback 200g
};

// Helper to calculate total delivery fee
const calculateDeliveryFee = async (orderItems: any[]) => {
    let totalWeight = 0;

    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.weight) {
            totalWeight += getWeightInKg(product.weight) * item.qty;
        } else {
            totalWeight += 0.2 * item.qty;
        }
    }

    if (totalWeight <= 1) {
        return 350;
    } else {
        const extraWeight = Math.ceil(totalWeight - 1);
        return 350 + (extraWeight * 80);
    }
};

// Helper to calculate total order price (items + shipping)
const calculateOrderAmount = async (orderItems: any[]) => {
    let itemsTotal = 0;
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            itemsTotal += product.price * item.qty;
        }
    }

    const shippingFee = await calculateDeliveryFee(orderItems);
    // Return simple total in LKR (Not cents for PayHere usually, but formatting handled in hash gen)
    return itemsTotal + shippingFee;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req: any, res: Response) => {
    const {
        orderItems,
        paymentMethod,
        itemsPrice,
        taxPrice,
        totalPrice,
    } = req.body;

    let { shippingAddress } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        // Check for shipping address
        if (!shippingAddress || !shippingAddress.address) {
            const defaultAddress = req.user.addresses.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
                shippingAddress = {
                    address: defaultAddress.address,
                    city: defaultAddress.city,
                    postalCode: defaultAddress.postalCode,
                    country: defaultAddress.country
                };
            } else if (req.user.addresses.length > 0) {
                const firstAddr = req.user.addresses[0];
                shippingAddress = {
                    address: firstAddr.address,
                    city: firstAddr.city,
                    postalCode: firstAddr.postalCode,
                    country: firstAddr.country
                };
            } else {
                res.status(400);
                throw new Error('Shipping address required');
            }
        }

        const calculatedShippingPrice = await calculateDeliveryFee(orderItems);

        let calculatedItemsPrice = 0;
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                calculatedItemsPrice += product.price * item.qty;
            }
        }

        const finalTotalPrice = calculatedItemsPrice + calculatedShippingPrice;

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: calculatedItemsPrice,
            taxPrice,
            shippingPrice: calculatedShippingPrice,
            totalPrice: finalTotalPrice,
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req: any, res: Response) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req: any, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            id: req.body.id || 'PAYHERE_' + Date.now(),
            status: req.body.status || 'Success',
            update_time: String(new Date()),
            email_address: req.body.email_address || req.user.email,
        };

        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req: any, res: Response) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Generate PayHere Hash
// @route   POST /api/orders/generate-payhere-hash
// @access  Private
const generatePayHereHash = asyncHandler(async (req: any, res: Response) => {
    const { orderId, amount, currency } = req.body;

    if (!orderId || !amount || !currency) {
        res.status(400);
        throw new Error('Missing required fields');
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
        res.status(500);
        throw new Error('PayHere credentials not configured');
    }

    const formattedAmount = parseFloat(amount).toFixed(2);
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    res.json({
        hash,
        merchantId,
    });
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    generatePayHereHash
};
