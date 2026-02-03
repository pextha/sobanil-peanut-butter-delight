import path from 'path';
import express from "express";
import cors from "cors";
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import attributeRoutes from './routes/attributeRoutes';
import cartRoutes from './routes/cartRoutes';
import contactRoutes from './routes/contactRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);


const currentDir = path.resolve();
app.use('/uploads', express.static(path.join(currentDir, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;