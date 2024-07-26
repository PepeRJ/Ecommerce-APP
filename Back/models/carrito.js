const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario');


const Carrito = sequelize.define('carrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: false, 
});

Carrito.belongsTo(Usuario, { foreignKey: 'id_usuario' });

module.exports = Carrito;

