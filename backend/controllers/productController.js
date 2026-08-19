const db = require('../config/db');

// 1. Obtener todos los productos de UNA empresa específica
const getProducts = async (req, res) => {
  // Se lee desde los params de consulta (ej. /api/products?company_id=1) o req.user
  const company_id = req.query.company_id || req.headers['x-company-id'];

  if (!company_id) {
    return res.status(400).json({ message: 'El ID de la compañía es requerido' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE company_id = ? ORDER BY id DESC',
      [company_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener productos' });
  }
};

// 2. Crear un nuevo producto vinculado a la empresa
const createProduct = async (req, res) => {
  const { name, costPrice, salePrice, stock, company_id } = req.body;

  if (!company_id || !name || costPrice === undefined || salePrice === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, incluyendo company_id' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO products (company_id, name, costPrice, salePrice, stock) VALUES (?, ?, ?, ?, ?)',
      [company_id, name, costPrice, salePrice, stock]
    );

    res.status(201).json({
      id: result.insertId,
      company_id,
      name,
      costPrice: Number(costPrice),
      salePrice: Number(salePrice),
      stock: Number(stock)
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error en el servidor al crear producto' });
  }
};

// 3. Actualizar un producto existente asegurando pertenencia a la empresa
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, costPrice, salePrice, stock, company_id } = req.body;

  try {
    // El WHERE incluye company_id para evitar que una empresa modifique productos de otra
    const [result] = await db.query(
      'UPDATE products SET name = ?, costPrice = ?, salePrice = ?, stock = ? WHERE id = ? AND company_id = ?',
      [name, costPrice, salePrice, stock, id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o no pertenece a tu compañía' });
    }

    res.json({ id: Number(id), company_id, name, costPrice, salePrice, stock });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar producto' });
  }
};

// 4. Eliminar un producto validando pertenencia a la empresa
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const company_id = req.query.company_id || req.body.company_id;

  try {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ? AND company_id = ?',
      [id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o no pertenece a tu compañía' });
    }

    res.json({ message: 'Producto eliminado correctamente', id: Number(id) });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar producto' });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};