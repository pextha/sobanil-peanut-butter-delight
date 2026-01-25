import express from "express";
import cors from "cors";
// import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// app.get("/", (_req, res) => res.send("Backend is working!"));

//app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // <--- 2. Use Routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
