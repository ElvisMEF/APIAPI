import express from 'express';
import authRoutes from './routes/auth.js';
import userRoutes from "./routes/users.js";
import hostRoutes from "./routes/hosts.js";
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import propertyRoutes from './routes/properties.js';


const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});


// register routes
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/hosts', hostRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);
app.use('/properties', propertyRoutes);
  
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An error occurred on the server, please double-check your request!" });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000');
});
