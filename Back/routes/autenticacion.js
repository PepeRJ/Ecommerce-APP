const express = require('express');
const passport = require('passport');
const authController = require('../controllers/autenticacion');
const router = express.Router();
const verificarSesion = require('../middleware/verificarSesion');

// Ruta para registro
router.post('/registro', authController.registro);

// Ruta para inicio de sesión
router.post('/inicio-sesion', passport.authenticate('local'), authController.inicioSesion);

// Ruta para cerrar sesión
router.post('/cerrar-sesion', authController.cerrarSesion);

// Ruta para obtener los datos actuales de un usuario (protegida con verificarToken)
router.get('/perfil/:id_usuario', verificarSesion, authController.obtenerDatosUsuario);

// Ruta para editar los datos de un usuario y sus teléfonos (protegida con verificarToken)
router.put('/perfil/:id_usuario', verificarSesion, authController.editarPerfil);

module.exports = router;
