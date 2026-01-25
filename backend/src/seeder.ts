import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users';
import products from './data/products';
import User from './models/userModel';
import Product from './models/productModel';
import Order from './models/orderModel';
import connectDB from './config/db';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // 1. Clear any existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Add Users
    const createdUsers = await User.insertMany(users);
    
    // 3. Get the Admin User's ID (to assign as the 'creator' of products)
    const adminUser = createdUsers[0]._id;

    // 4. Add Admin ID to each product and save them
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported! Database "sobanil_store" is now created.');
    process.exit();
  } catch (error) {
    console.error(` Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(` Error: ${error}`);
    process.exit(1);
  }
};

// Check command line arguments to decide whether to import or destroy
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}