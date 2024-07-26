const Pedido = require('../models/pedido');
const Carrito = require('../models/carrito');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const CarritoProducto = require('../models/carrito_productos');
const { Sequelize } = require('sequelize');



exports.crearPedido = async (req, res) => {
  console.log('Recibida solicitud POST en /pedido');
  const { id_usuario, id_carrito } = req.body;

  try {
    console.log('ID de usuario y carrito:', id_usuario, id_carrito);
    
    let usuario;
    try {
      usuario = await Usuario.findByPk(id_usuario);
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    console.log('Usario encontrado:', usuario);

    let carrito;
    try {
      carrito = await Carrito.findByPk(id_carrito);
    } catch (error) {
      console.error('Error al buscar carrito:', error);
      return res.status(500).json({ error: 'Error al buscar carrito' });
    }
    console.log('Carrito encontrado:', carrito);

    if (!usuario || !carrito) {
      console.error('Usuario o carrito no encontrado');
      return res.status(404).json({ error: 'Usuario o carrito no encontrado' });
    }

    let productosEnCarrito;
    try {
      productosEnCarrito = await CarritoProducto.findAll({
        where: { id_carrito: carrito.id },
        include: Producto,
      });
    } catch (error) {
      console.error('Error al buscar productos en carrito:', error);
      return res.status(500).json({ error: 'Error al buscar productos en carrito' });
    }
    console.log('Productos en carrito:', productosEnCarrito);

    if (productosEnCarrito.length === 0) {
      console.log('El carrito está vacío');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    let precio_total_en_euros = 0;
    
    for (const productoEnCarrito of productosEnCarrito) {
      if (!productoEnCarrito.producto) {
        console.error("Producto no encontrado:", productoEnCarrito);
        continue;
      }
      if (productoEnCarrito.producto.precio == null) {
        console.error("Producto sin precio válido:", productoEnCarrito.producto);
        continue;
      }

      precio_total_en_euros += productoEnCarrito.producto.precio * productoEnCarrito.cantidad;

      const cantidadVendida = productoEnCarrito.cantidad;
      console.log(`Actualizando stock de producto ID ${productoEnCarrito.producto.id}, cantidad vendida: ${cantidadVendida}`);
      try {
        await Producto.update(
          { stock: Sequelize.literal(`stock - ${cantidadVendida}`) },
          { where: { id: productoEnCarrito.producto.id } }
        );
      } catch (error) {
        console.error('Error al actualizar stock del producto:', error);
        return res.status(500).json({ error: 'Error al actualizar stock del producto' });
      }
    }

    console.log('Precio total en euros:', precio_total_en_euros);

    const fechaActual = new Date();
    console.log('Fecha actual:', fechaActual);

    let pedido;
    try {
      pedido = await Pedido.create({
        id_usuario,
        id_carrito,
        fecha: fechaActual,
        estado: 'en camino',
        precio_total: precio_total_en_euros,
        productos: productosEnCarrito.map(producto => ({
          nombre: producto.producto.nombre,
          cantidad: producto.cantidad,
          precio: `${producto.producto.precio}€`, // Directly formatting the price here
        })),
      });
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      return res.status(500).json({ error: 'Error al crear el pedido' });
    }

    console.log('Pedido creado:', pedido);

    res.status(200).json({ success: true, pedido });
  } catch (error) {
    console.error('Error inesperado al crear el pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.actualizarPedido = async (req, res) => {
    const { id_pedido } = req.params;
    const { estado } = req.body;
  
    try {
      const pedido = await Pedido.findByPk(id_pedido);
  
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  

      pedido.estado = estado;
      await pedido.save();
  
      res.json({ message: 'Estado del pedido actualizado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
  };

  exports.eliminarPedido = async (req, res) => {
    const { id_pedido } = req.params;
  
    try {
      const pedido = await Pedido.findByPk(id_pedido);
  
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  
 
      await pedido.destroy();
  
      res.json({ message: 'Pedido eliminado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el pedido' });
    }
  };



  exports.obtenerPedidosUsuario = async (req, res) => {
    const { id_usuario } = req.params;
  
    try {
      const pedidosUsuario = await Pedido.findAll({
        where: { id_usuario },
      });
  
      // Devolver un arreglo vacío con un estado 200 si no se encuentran pedidos
      res.status(200).json(pedidosUsuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los pedidos del usuario' });
    }
  };
