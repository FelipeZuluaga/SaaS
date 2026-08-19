const db = require('../config/db');

// Definición de límites por plan en el Backend
const PLAN_LIMITS = {
  Emprendedor: 50,
  PyME: 500,
  Pro: Infinity
};

// 1. Obtener todos los productos de UNA empresa específica
const getProducts = async (req, res) => {
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

// 2. Crear un nuevo producto (VALIDANDO LÍMITES DE LICENCIA)
const createProduct = async (req, res) => {
  const { name, costPrice, salePrice, stock, company_id } = req.body;

  if (!company_id || !name || costPrice === undefined || salePrice === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, incluyendo company_id' });
  }

  try {
    // 🛑 VALIDACIÓN DE LICENCIA / PLAN DE LA EMPRESA
    // A. Consultar el plan de la empresa
    const [companyRows] = await db.query(
      'SELECT plan FROM companies WHERE id = ?',
      [company_id]
    );

    if (companyRows.length === 0) {
      return res.status(404).json({ message: 'La compañía especificada no existe' });
    }

    const currentPlan = companyRows[0].plan || 'Emprendedor';
    const maxAllowedProducts = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.Emprendedor;

    // B. Si el plan no es ilimitado, verificar cuántos productos tiene la empresa
    if (maxAllowedProducts !== Infinity) {
      const [countResult] = await db.query(
        'SELECT COUNT(*) as total FROM products WHERE company_id = ?',
        [company_id]
      );

      const currentCount = countResult[0].total;

      if (currentCount >= maxAllowedProducts) {
        return res.status(403).json({
          message: `Has alcanzado el límite de ${maxAllowedProducts} productos permitidos en tu ${currentPlan}. Por favor actualiza tu licencia para continuar agregando productos.`,
          code: 'PLAN_LIMIT_REACHED',
          limit: maxAllowedProducts
        });
      }
    }

    // C. Si cumple con la licencia, procedemos a crear el producto normalmente
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