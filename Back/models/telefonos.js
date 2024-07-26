const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 


const Telefonos = sequelize.define('telefonos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {

  tableName: 'telefonos', 
  timestamps: false, 
});



module.exports = Telefonos; 
