const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto');
const verificarSesion = require('../middleware/verificarSesion'); 

router.get('/', productoController.getListaProductos); 
router.post('/', verificarSesion, productoController.createProducto);
router.put('/:id_producto', verificarSesion, productoController.editProducto);
router.delete('/:id_producto', verificarSesion, productoController.deleteProducto);

module.exports = router;
