const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido');
const verificarSesion = require('../middleware/verificarSesion'); 


router.post('/', verificarSesion, pedidoController.crearPedido);
router.get('/:id_usuario', verificarSesion, pedidoController.obtenerPedidosUsuario); 
router.put('/:id_pedido', verificarSesion, pedidoController.actualizarPedido);
router.delete('/eliminar/:id_pedido', verificarSesion, pedidoController.eliminarPedido); 

module.exports = router;
