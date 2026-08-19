const db = require('../config/db');

// Obtener métricas detalladas para Ganancias Netas
const getNetProfits = async (req, res) => {
  try {
    // 1. Suma total de Ingresos por Ventas
    const [salesSummary] = await db.query(`
      SELECT 
        COUNT(id) AS totalSalesCount,
        COALESCE(SUM(total), 0) AS totalRevenue
      FROM sales
    `);

    // 2. Suma del Costo de los productos que han sido vendidos
    const [costSummary] = await db.query(`
      SELECT 
        COALESCE(SUM(si.quantity * p.costPrice), 0) AS totalCost
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
    `);

    // 3. Valorización del Inventario actual disponible
    const [inventorySummary] = await db.query(`
      SELECT 
        COALESCE(SUM(stock * costPrice), 0) AS totalInventoryCostValue,
        COALESCE(SUM(stock * salePrice), 0) AS totalInventorySaleValue
      FROM products
    `);

    const totalRevenue = Number(salesSummary[0].totalRevenue);
    const totalCost = Number(costSummary[0].totalCost);
    const netProfit = totalRevenue - totalCost;
    
    // Cálculo de margen de ganancia porcentual
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin: Number(profitMargin),
      totalSalesCount: salesSummary[0].totalSalesCount,
      inventoryMetrics: {
        inventoryCostValue: Number(inventorySummary[0].totalInventoryCostValue),
        inventorySaleValue: Number(inventorySummary[0].totalInventorySaleValue)
      }
    });
  } catch (error) {
    console.error('Error al calcular ganancias netas:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener las ganancias netas' });
  }
};

module.exports = {
  getNetProfits
};