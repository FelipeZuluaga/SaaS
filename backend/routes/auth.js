const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <-- LÍNEA 3: Debe apuntar a config/db[cite: 8]
const upload = require('../middleware/upload'); //[cite: 8]
const bcrypt = require('bcryptjs'); //[cite: 8]
const jwt = require('jsonwebtoken'); //[cite: 8]

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_novaforge'; //[cite: 8]

// -------------------------------------------------------------
// 1. REGISTRO (Onboarding)
// -------------------------------------------------------------
router.post('/register', upload.single('logo'), async (req, res) => {
  // Leemos opcionalmente el plan que selecciona el cliente al registrarse
  const { companyName, businessType, username, password, plan } = req.body; //[cite: 8]

  if (!companyName || !businessType || !username || !password) { //[cite: 8]
    return res.status(400).json({ message: 'Todos los campos son obligatorios' }); //[cite: 8]
  }

  try {
    const [existingCompany] = await db.query('SELECT id FROM companies WHERE name = ?', [companyName]); //[cite: 8]
    if (existingCompany.length > 0) { //[cite: 8]
      return res.status(400).json({ message: 'El nombre de esta compañía ya está registrado' }); //[cite: 8]
    }

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null; //[cite: 8]
    // Si no especifican plan, asignamos 'Emprendedor' por defecto
    const selectedPlan = plan || 'Emprendedor';

    // Insertamos la compañía incluyendo la columna `plan`
    const [companyResult] = await db.query(
      'INSERT INTO companies (name, business_type, plan, logo_url) VALUES (?, ?, ?, ?)',
      [companyName, businessType, selectedPlan, logoUrl]
    );
    const companyId = companyResult.insertId; //[cite: 8]

    const salt = await bcrypt.genSalt(10); //[cite: 8]
    const hashedPassword = await bcrypt.hash(password, salt); //[cite: 8]

    await db.query(
      'INSERT INTO users (company_id, username, password, role) VALUES (?, ?, ?, ?)',
      [companyId, username, hashedPassword, 'admin'] //[cite: 8]
    );

    res.status(201).json({ 
      message: 'Sistema configurado con éxito', 
      companyId,
      plan: selectedPlan 
    });

  } catch (error) {
    console.error('Error en el registro:', error); //[cite: 8]
    res.status(500).json({ message: 'Error interno del servidor' }); //[cite: 8]
  }
});

// -------------------------------------------------------------
// 2. INICIO DE SESIÓN (Login)
// -------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { companyName, username, password } = req.body; //[cite: 8]

  if (!companyName || !username || !password) { //[cite: 8]
    return res.status(400).json({ message: 'Por favor ingresa todos los campos' }); //[cite: 8]
  }

  try {
    const [companies] = await db.query('SELECT * FROM companies WHERE name = ?', [companyName]); //[cite: 8]
    if (companies.length === 0) { //[cite: 8]
      return res.status(404).json({ message: 'Compañía no encontrada' }); //[cite: 8]
    }
    const company = companies[0]; //[cite: 8]

    const [users] = await db.query(
      'SELECT * FROM users WHERE company_id = ? AND username = ?', 
      [company.id, username] //[cite: 8]
    );

    if (users.length === 0) { //[cite: 8]
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' }); //[cite: 8]
    }
    const user = users[0]; //[cite: 8]

    const isPasswordValid = await bcrypt.compare(password, user.password); //[cite: 8]
    if (!isPasswordValid) { //[cite: 8]
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' }); //[cite: 8]
    }

    // Obtenemos el plan de la BD (si está vacío, asumimos 'Emprendedor')
    const companyPlan = company.plan || 'Emprendedor';

    // Incluimos el plan en el Token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        companyId: company.id, 
        companyName: company.name,
        plan: companyPlan,
        logoUrl: company.logo_url 
      },
      JWT_SECRET,
      { expiresIn: '8h' } //[cite: 8]
    );

    // Devolvemos el campo `plan` en el objeto company hacia React
    res.json({
      message: 'Inicio de sesión exitoso', //[cite: 8]
      token, //[cite: 8]
      company: {
        id: company.id, //[cite: 8]
        name: company.name, //[cite: 8]
        businessType: company.business_type, //[cite: 8]
        plan: companyPlan, // 👈 Se envía al frontend para activar/desactivar bloqueos
        logoUrl: company.logo_url //[cite: 8]
      },
      user: {
        id: user.id, //[cite: 8]
        username: user.username, //[cite: 8]
        role: user.role //[cite: 8]
      }
    });

  } catch (error) {
    console.error('Error en el login:', error); //[cite: 8]
    res.status(500).json({ message: 'Error al iniciar sesión' }); //[cite: 8]
  }
});

module.exports = router; //[cite: 8]