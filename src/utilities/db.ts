import { SequelizeModule } from '@nestjs/sequelize';

export default SequelizeModule.forRoot({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  database: 'storeroomdb',
  models: [],
});
