import { DataTypes } from 'sequelize';
import sequelize from '../../configs/config.js';

const campaignsTableModel = sequelize.define('campaigns', 
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
  timestamps: true,
  }
);

// TRUNCATE TABLE campaigns RESTART IDENTITY;

export default campaignsTableModel
