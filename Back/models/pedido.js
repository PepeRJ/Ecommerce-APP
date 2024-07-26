const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Carrito = require('./carrito');
const CarritoProducto = require('./carrito_productos'); 

const Pedido = sequelize.define('pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio_total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'pedido',
  timestamps: false,
});

Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Pedido.belongsTo(Carrito, { foreignKey: 'id_carrito' });


module.exports = Pedido;
