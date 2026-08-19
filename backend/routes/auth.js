const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <-- LÍNEA 3: Debe apuntar a config/db
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_novaforge';

// -------------------------------------------------------------
// 1. REGISTRO (Onboarding)
// -------------------------------------------------------------
router.post('/register', upload.single('logo'), async (req, res) => {
  const { companyName, businessType, username, password } = req.body;

  if (!companyName || !businessType || !username || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const [existingCompany] = await db.query('SELECT id FROM companies WHERE name = ?', [companyName]);
    if (existingCompany.length > 0) {
      return res.status(400).json({ message: 'El nombre de esta compañía ya está registrado' });
    }

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [companyResult] = await db.query(
      'INSERT INTO companies (name, business_type, logo_url) VALUES (?, ?, ?)',
      [companyName, businessType, logoUrl]
    );
    const companyId = companyResult.insertId;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (company_id, username, password, role) VALUES (?, ?, ?, ?)',
      [companyId, username, hashedPassword, 'admin']
    );

    res.status(201).json({ message: 'Sistema configurado con éxito', companyId });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// -------------------------------------------------------------
// 2. INICIO DE SESIÓN (Login)
// -------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { companyName, username, password } = req.body;

  if (!companyName || !username || !password) {
    return res.status(400).json({ message: 'Por favor ingresa todos los campos' });
  }

  try {
    const [companies] = await db.query('SELECT * FROM companies WHERE name = ?', [companyName]);
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Compañía no encontrada' });
    }
    const company = companies[0];

    const [users] = await db.query(
      'SELECT * FROM users WHERE company_id = ? AND username = ?', 
      [company.id, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        companyId: company.id, 
        companyName: company.name,
        logoUrl: company.logo_url 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      company: {
        id: company.id,
        name: company.name,
        businessType: company.business_type,
        logoUrl: company.logo_url
      },
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;