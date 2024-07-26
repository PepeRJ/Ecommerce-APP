const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito');
const verificarSesion = require('../middleware/verificarSesion');


router.post('/add', verificarSesion, carritoController.addProductoAlCarrito);
router.put('/modificar-cantidad/:id_usuario', verificarSesion, carritoController.modificarCantidadEnCarrito);
router.get('/:id_usuario', verificarSesion, carritoController.getCarrito);
router.delete('/vaciar/:id_usuario', verificarSesion, carritoController.vaciarCarrito);

module.exports = router;
