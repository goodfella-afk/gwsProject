import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// Test connection

const testDbConnection = async() => {
  try {
   await sequelize.authenticate();
   console.log('connection to psql sucesfull');
  } catch (error) {
   console.error('psql connection failed', error) ;
  }
};

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); 
    console.log('Database synced sucesfully');

  } catch (error) {
    console.log('db sync failed with error: ', error);
  }
}

testDbConnection();
syncDatabase();


//Export Sequelize instance
export default sequelize;