const Carrito = require('../models/carrito');
const CarritoProducto = require('../models/carrito_productos');
const Producto = require('../models/producto');

exports.addProductoAlCarrito = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;
  console.log('Agregando producto al carrito. Usuario ID:', id_usuario, 'Producto ID:', id_producto, 'Cantidad:', cantidad);

  try {    
    const carrito = await Carrito.findOne({ where: { id_usuario } });
    if (!carrito) {
      console.log('El carrito no existe para el usuario ID:', id_usuario);
      return res.status(404).json({ error: 'El carrito no existe' });
    }

    const existingProducto = await CarritoProducto.findOne({ where: { id_carrito: carrito.id, id_producto } });
    const producto = await Producto.findByPk(id_producto);

    if (!producto) {
      console.log('El producto con ID', id_producto, 'no existe');
      return res.status(404).json({ error: 'El producto no existe' });
    }

    if (existingProducto) {
      existingProducto.cantidad += cantidad;

      if (existingProducto.cantidad > producto.stock) {
        console.log('No puedes agregar más productos de los disponibles en el stock');
        return res.status(400).json({ error: 'No puedes agregar más productos de los disponibles en el stock' });
      }

      await existingProducto.save();
    } else {
      if (producto.stock === 1) {
        const updatedExistingProducto = await CarritoProducto.findOne({ where: { id_carrito: carrito.id, id_producto } });

        if (updatedExistingProducto) {
          console.log('No puedes agregar más de un producto al carrito, el stock es igual a 1');
          return res.status(400).json({ error: 'No puedes agregar más de un producto al carrito, el stock es igual a 1' });
        }
      }

      if (cantidad <= producto.stock) {
        await CarritoProducto.create({ id_carrito: carrito.id, id_producto, cantidad });
      } else {
        console.log('No puedes agregar más productos de los disponibles en el stock');
        return res.status(400).json({ error: 'No puedes agregar más productos de los disponibles en el stock' });
      }
    }

    carrito.cantidad += cantidad;
    await carrito.save();



    res.json({ message: 'Producto añadido al carrito con éxito' });
  } catch (error) {
    console.error('Error al agregar el producto al carrito: ', error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  } 
};

exports.modificarCantidadEnCarrito = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;
  console.log('Modificando cantidad en el carrito. Usuario ID:', id_usuario, 'Producto ID:', id_producto, 'Nueva Cantidad:', cantidad);

  try {  
    const carrito = await Carrito.findOne({ where: { id_usuario } });

    if (!carrito) {
      console.log('El carrito no existe para el usuario ID:', id_usuario);
      return res.status(404).json({ error: 'El carrito no existe' });
    }

    const carritoProducto = await CarritoProducto.findOne({ where: { id_carrito: carrito.id, id_producto } });

    if (!carritoProducto) {
      console.log('El producto no existe en el carrito');
      return res.status(404).json({ error: 'El producto no existe en el carrito' });
    }

    const producto = await Producto.findByPk(id_producto);

    if (!producto) {
      console.log('El producto con ID', id_producto, 'no existe');
      return res.status(404).json({ error: 'El producto no existe' });
    }

    if (cantidad > producto.stock) {
      console.log('No puedes agregar más productos de los disponibles en el stock');
      return res.status(400).json({ error: 'No puedes agregar más productos de los disponibles en el stock' });
    }

    carrito.cantidad = cantidad;
    await carrito.save();

    carritoProducto.cantidad = cantidad;
    await carritoProducto.save();



    res.json({ message: 'Cantidad modificada con éxito' });
  } catch (error) {
    console.error('Error al modificar la cantidad: ', error);
    res.status(500).json({ error: 'Error al modificar la cantidad' });
  }
};

exports.getCarrito = async (req, res) => {
  const { id_usuario } = req.params; 
  console.log('Obteniendo carrito para el usuario ID:', id_usuario);

  try {
    const carrito = await Carrito.findOne({ where: { id_usuario } });

    if (!carrito) {
      console.log('El carrito no existe para el usuario ID:', id_usuario);
      return res.status(404).json({ error: 'El carrito no existe' });
    }

    const carritoProductos = await CarritoProducto.findAll({
      where: { id_carrito: carrito.id },
      include: {
        model: Producto,
        attributes: {
          exclude: ['descripcion'],
        },
      },
      attributes: {
        exclude: ['id_usuario'],
      },
    });

    if (!carritoProductos || carritoProductos.length === 0) {
      console.log('El carrito está vacío');
      return res.status(200).json({ message: 'El carrito está vacío', carritoId: carrito.id, carritoProductos: [], precioTotal: 0 });
    }

    const precioTotal = carritoProductos.reduce((total, item) => {
      return total + item.producto.precio * item.cantidad;
    }, 0);

    const formattedCarritoProductos = carritoProductos.map(item => ({
      producto: {
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
      },
      cantidad: item.cantidad,
    }));


    res.json({ carritoId: carrito.id, carritoProductos: formattedCarritoProductos, precioTotal });
  } catch (error) {
    console.error('Error al obtener el carrito: ', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};


exports.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  console.log('Vaciando carrito para el usuario ID:', id_usuario);

  try {
    const carrito = await Carrito.findOne({ where: { id_usuario } });

    if (!carrito) {
      console.log('El carrito no existe para el usuario ID:', id_usuario);
      return res.status(404).json({ error: 'El carrito no existe' });
    }

    carrito.cantidad = 0; 
    await carrito.save();

    await CarritoProducto.destroy({ where: { id_carrito: carrito.id }});

  
    res.json({ message: 'Carrito vaciado con éxito' });

  } catch (error) {
    console.error('Error al vaciar el carrito: ', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};