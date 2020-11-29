const db = require ('../../config/db_config');

const transactions = db.sequelize.define('trades', {
  id: {
    type: db.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stock: {
    type: db.DataTypes.STRING,
  },
  quantity: {
    type: db.DataTypes.DOUBLE,
  },
  value: {
    type: db.DataTypes.DOUBLE,
  },
  buy_sell: {
    type: db.DataTypes.BOOLEAN,
    required: true
  },
  user_id: {
    type: db.DataTypes.INTEGER,
    required: true
  },
  is_deleted: {
    type: db.DataTypes.BOOLEAN,
    required: true,
    defaultValue: 0
  },
  createdAt: db.DataTypes.DATE,
  updatedAt: db.DataTypes.DATE,
});

module.exports = transactions;
