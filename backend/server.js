require("dotenv").config(); // Siempre en la línea 1
const express = require("express");
const cors = require("cors");
const path = require("path"); // <-- AGREGADO
const db = require("./config/db");

// Importación de Rutas
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/auth'); // <-- AGREGADO

const app = express();

// --- Middleware Global ---
app.use(cors());
app.use(express.json());

// --- Uso de Rutas ---
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Servir la carpeta de logos/imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Puerto ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});