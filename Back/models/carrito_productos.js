const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('./producto');
const Carrito = require('./carrito');

const CarritoProducto = sequelize.define('carrito_productos', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, 
  },

}, {
  timestamps: false, 
  underscored: true, 
});



CarritoProducto.removeAttribute('id');
CarritoProducto.belongsTo(Producto, { foreignKey: 'id_producto' });
CarritoProducto.belongsTo(Carrito, { foreignKey: 'id_carrito' });

module.exports = CarritoProducto;
