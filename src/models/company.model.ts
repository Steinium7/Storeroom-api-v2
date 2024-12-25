import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'companies',
  timestamps: true,
})
export class Company extends Model<Company> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: () => uuidv4().replace(/-/g, '').slice(0, 24),
  })
  slug: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  admin: string;
}
