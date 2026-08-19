const db = require('../config/db');

// 1. Obtener el historial de ventas de una empresa específica
const getSales = async (req, res) => {
  const company_id = req.query.company_id || req.headers['x-company-id'];

  if (!company_id) {
    return res.status(400).json({ message: 'El ID de la compañía es requerido' });
  }

  try {
    // A. Filtrar la lista de ventas por compañía
    const [sales] = await db.query(
      'SELECT * FROM sales WHERE company_id = ? ORDER BY id DESC',
      [company_id]
    );

    // B. Mapear los ítems de cada venta
    const salesWithItems = await Promise.all(
      sales.map(async (sale) => {
        const [items] = await db.query(
          `SELECT si.id, si.product_id, si.quantity, si.unit_price, p.name 
           FROM sale_items si 
           JOIN products p ON si.product_id = p.id 
           WHERE si.sale_id = ?`,
          [sale.id]
        );
        return {
          ...sale,
          items
        };
      })
    );

    res.json(salesWithItems);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener historial de ventas' });
  }
};

// 2. Registrar una nueva venta vinculada a la empresa (Transacción SQL)
const createSale = async (req, res) => {
  const { items, total, company_id } = req.body;

  if (!company_id) {
    return res.status(400).json({ message: 'El ID de la compañía es obligatorio' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'El carrito no puede estar vacío' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // A. Insertar el encabezado de la venta con su company_id
    const [saleResult] = await connection.query(
      'INSERT INTO sales (company_id, total) VALUES (?, ?)',
      [company_id, total]
    );
    const saleId = saleResult.insertId;

    // B. Procesar cada producto del carrito
    for (const item of items) {
      // Validar que el producto exista Y pertenezca a la compañía actual
      const [productRows] = await connection.query(
        'SELECT stock FROM products WHERE id = ? AND company_id = ?',
        [item.id, company_id]
      );

      if (productRows.length === 0) {
        throw new Error(`El producto con ID ${item.id} no existe o no pertenece a tu compañía.`);
      }

      const currentStock = productRows[0].stock;
      if (currentStock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${item.name}`);
      }

      // Descontar stock asegurando pertenencia de la empresa
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND company_id = ?',
        [item.quantity, item.id, company_id]
      );

      // Insertar detalle en sale_items
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [saleId, item.id, item.quantity, item.salePrice]
      );
    }

    // Confirmar la transacción
    await connection.commit();

    res.status(201).json({
      message: 'Venta registrada con éxito',
      sale: {
        id: saleId,
        company_id,
        date: new Date().toLocaleString('es-CO'),
        total,
        items
      }
    });
  } catch (error) {
    // Si algo falla, revertimos todas las inserciones/descuentos
    await connection.rollback();
    console.error('Error en transacción de venta:', error);
    res.status(400).json({ message: error.message || 'Error al procesar la venta' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getSales,
  createSale
};