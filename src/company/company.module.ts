import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyController } from './company.controller';
import { Company } from 'src/models/company.model';

@Module({
  imports: [SequelizeModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
