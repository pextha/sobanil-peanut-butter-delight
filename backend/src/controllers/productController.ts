import { Request, Response } from 'express';
// @ts-ignore
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, 
    price, 
    description, 
    imageUrl, 
    flavor, 
    category, 
    countInStock, 
    weight 
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;
    product.flavor = flavor;
    product.category = category; // Fix: Update category
    product.countInStock = countInStock;
    product.weight = weight;     // Fix: Update weight

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: any, res: Response) => {
  const { 
    name, 
    price, 
    description, 
    imageUrl, 
    flavor, 
    category, 
    countInStock, 
    weight 
  } = req.body;

  const product = new Product({
    name,
    price,
    user: req.user._id,
    imageUrl, 
    flavor,
    category,
    countInStock,
    description,
    weight, // Fix: Save weight
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});