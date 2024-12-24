import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'people',
  timestamps: true,
})
export class People extends Model<People> {
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
  firstname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastname: string;
}
