const  Producto  = require('../models/producto');


exports.getListaProductos = async function (req, res) {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de productos' });
  }
}

// Crear un nuevo producto (para administradores)

exports.createProducto = async function (req, res) {
  const usuarioActual = req.isAuthenticated() ? req.user.correo_electronico : null;

  if (usuarioActual !== 'peperj7@gmail.com') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  const { nombre, descripcion, precio, stock, imagen_url } = req.body;

  try {
    const producto = await Producto.create({ nombre, descripcion, precio, stock, imagen_url });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto', message: error.message });
  }
};

exports.editProducto = async function (req, res) {
  const usuarioActual = req.isAuthenticated() ? req.user.correo_electronico : null;

  if (usuarioActual !== 'peperj7@gmail.com') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  const { id_producto } = req.params;
  const { nombre, descripcion, precio, stock, imagen_url } = req.body;

  try {
    const producto = await Producto.findByPk(id_producto);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }


    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.precio = precio;
    producto.stock = stock;
    producto.imagen_url = imagen_url;


    await producto.save();

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar producto', message: error.message });
  }
};

exports.deleteProducto = async function (req, res) {
  const usuarioActual = req.isAuthenticated() ? req.user.correo_electronico : null;

  if (usuarioActual !== 'peperj7@gmail.com') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  const { id_producto } = req.params;

  try {
    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await producto.destroy();
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};