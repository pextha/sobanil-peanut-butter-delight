import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Category, Flavor, Weight } from '../models/attributeModel';

// --- GENERIC HELPER ---
const getItems = (Model: any) => asyncHandler(async (req: Request, res: Response) => {
  const items = await Model.find({});
  res.json(items);
});

const createItem = (Model: any) => asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const exists = await Model.findOne({ name });
  
  if (exists) {
    res.status(400);
    throw new Error('Item already exists');
  }

  const item = await Model.create({ name });
  res.status(201).json(item);
});

// --- EXPORT SPECIFIC FUNCTIONS ---
export const getCategories = getItems(Category);
export const createCategory = createItem(Category);

export const getFlavors = getItems(Flavor);
export const createFlavor = createItem(Flavor);

export const getWeights = getItems(Weight);
export const createWeight = createItem(Weight);