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
  // We get these new values from the form data
  const { name, price, description, imageUrl, flavor, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl; // Updated to match your model
    product.flavor = flavor;     // Updated to match your model
    product.countInStock = countInStock;

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
  const { name, price, description, imageUrl, flavor, category, countInStock } = req.body;

  const product = new Product({
    name: name,
    price: price,
    user: req.user._id,
    imageUrl: imageUrl, 
    flavor: flavor,
    category: category,
    countInStock: countInStock,
    description: description,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});