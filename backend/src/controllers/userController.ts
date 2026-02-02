import { Request, Response } from 'express';
// @ts-ignore
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import generateToken from '../utils/generateToken';

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Find the user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists AND password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
      wishlist: user.wishlist,
      token: generateToken(user._id.toString()), // Send the token!
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 2. Create the new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // 3. Send back their info
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
      wishlist: user.wishlist,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: any, res: Response) => {
  // We can access req.user because of our middleware!
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
      wishlist: user.wishlist,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id.toString()),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add an address
// @route   POST /api/users/profile/address
// @access  Private
export const addAddress = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, phone, address, city, postalCode, country, isDefault } = req.body;

    // If setting as default, unset others
    if (isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      // First address always default
      // req.body.isDefault = true; // careful with direct mutation
    }

    const newAddress = {
      name, phone, address, city, postalCode, country, isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();

    // Return the updated addresses to refresh frontend 
    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete an address
// @route   DELETE /api/users/profile/address/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== req.params.id
    );
    await user.save();
    res.json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update an address (mostly for setting default)
// @route   PUT /api/users/profile/address/:id
// @access  Private
export const updateAddress = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const addressToUpdate = user.addresses.find((addr: any) => addr._id.toString() === req.params.id);

    if (addressToUpdate) {
      if (req.body.isDefault) {
        user.addresses.forEach((addr: any) => {
          addr.isDefault = false;
        });
        addressToUpdate.isDefault = true;
      }

      // Update other fields if provided
      if (req.body.address) addressToUpdate.address = req.body.address;
      if (req.body.city) addressToUpdate.city = req.body.city;
      if (req.body.postalCode) addressToUpdate.postalCode = req.body.postalCode;
      if (req.body.country) addressToUpdate.country = req.body.country;

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req: any, res: Response) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.wishlist.includes(productId)) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }
    user.wishlist.push(productId);
    await user.save();
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
export const removeFromWishlist = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
    await user.save();
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});