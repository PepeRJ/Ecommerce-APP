const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/verificarSesion');


app.get('/ruta-protegida', verificarToken, (req, res) => {

  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});
