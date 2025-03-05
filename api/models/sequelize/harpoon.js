import { DataTypes } from 'sequelize';
import sequelize from '../../configs/config.js';

const harpoonTemplatesTableModel = sequelize.define(
  'harpoonTemplates', 
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isHtml: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export default harpoonTemplatesTableModel; 
