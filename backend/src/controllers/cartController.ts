import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req as any & { user: { _id: string } }; // Type assertion for extended Request

    // Find cart and populate product details (name, price, image, etc.)
    const cart = await Cart.findOne({ user: reqUser.user._id }).populate(
        'cartItems.product',
        'name price imageUrl flavor weight countInStock'
    );

    if (cart) {
        res.json(cart);
    } else {
        // If no cart found, return an empty structure nicely or just create one?
        // Let's just return empty items to simplify frontend logic
        res.json({ cartItems: [] });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const reqUser = req as any & { user: { _id: string } };

    // Validate Qty
    const qty = Number(quantity);
    if (!qty || qty < 1) {
        res.status(400);
        throw new Error('Invalid quantity');
    }

    let cart = await Cart.findOne({ user: reqUser.user._id });

    if (cart) {
        // Cart exists, check if product already in cart
        const itemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Product exists, update quantity
            // Logic: Are we adding TO existing or replacing? Usually "Add to Cart" means +qty. 
            // User requested "update dynamically".
            // Let's assume this endpoint is "Add X quantity".
            // If we want "Update to X", we might use a different logic or flag.
            // Standard "Add to Cart" button usually means INCREMENT.
            // However, for "Update dynamic", maybe we simply set it.
            // Let's support both or just make it SET logic if the user passes a specific flag?
            // Simplest: If it's a POST, it's usually "Add". If user changes qty in cart page, that's often a PUT.

            // I'll treat POST as "Add/Merge". 
            cart.cartItems[itemIndex].quantity += qty;
        } else {
            // Product not in cart, push new
            cart.cartItems.push({ product: productId, quantity: qty } as any);
        }

        await cart.save();

        // Return the updated cart with populated fields
        const updatedCart = await Cart.findOne({ user: reqUser.user._id }).populate(
            'cartItems.product',
            'name price imageUrl flavor weight countInStock'
        );
        res.status(200).json(updatedCart);

    } else {
        // No cart, create new
        const newCart = await Cart.create({
            user: reqUser.user._id,
            cartItems: [{ product: productId, quantity: qty }],
        });

        const populatedCart = await Cart.findById(newCart._id).populate(
            'cartItems.product',
            'name price imageUrl flavor weight countInStock'
        );

        res.status(201).json(populatedCart);
    }
});

// @desc    Update cart item quantity (Set absolute value)
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req as any & { user: { _id: string } };
    const { quantity } = req.body;
    const productId = req.params.id; // Passing product ID in URL

    const cart = await Cart.findOne({ user: reqUser.user._id });

    if (cart) {
        const itemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            if (quantity > 0) {
                cart.cartItems[itemIndex].quantity = quantity;
            } else {
                // If 0, remove it
                cart.cartItems.splice(itemIndex, 1);
            }

            await cart.save();

            const updatedCart = await Cart.findOne({ user: reqUser.user._id }).populate(
                'cartItems.product',
                'name price imageUrl flavor weight countInStock'
            );
            res.json(updatedCart);
        } else {
            res.status(404);
            throw new Error('Item not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req as any & { user: { _id: string } };
    const productId = req.params.id;

    const cart = await Cart.findOne({ user: reqUser.user._id });

    if (cart) {
        cart.cartItems = cart.cartItems.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();

        const updatedCart = await Cart.findOne({ user: reqUser.user._id }).populate(
            'cartItems.product',
            'name price imageUrl flavor weight countInStock'
        );
        res.json(updatedCart);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req as any & { user: { _id: string } };

    await Cart.findOneAndDelete({ user: reqUser.user._id });

    res.json({ message: 'Cart cleared', cartItems: [] });
});

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
