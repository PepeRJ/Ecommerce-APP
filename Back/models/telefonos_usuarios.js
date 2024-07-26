const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Usuario = require('./usuario'); 
const Telefonos = require('./telefonos'); 

const TelefonosUsuarios = sequelize.define('telefonos_usuarios', {
  // Puedes definir otras propiedades si es necesario
}, {
  timestamps: false, 
  underscored: true,
  tableName: 'telefonos_usuarios', 
  freezeTableName: true,
});

TelefonosUsuarios.removeAttribute('id');
TelefonosUsuarios.belongsTo(Usuario, { foreignKey: 'id_usuario' });
TelefonosUsuarios.belongsTo(Telefonos, { foreignKey: 'id_telefonos' });

module.exports = TelefonosUsuarios;

