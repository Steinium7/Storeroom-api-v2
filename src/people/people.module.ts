import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { People } from '../models/people.model';

@Module({
  imports: [SequelizeModule.forFeature([People])],
  controllers: [PeopleController],
  providers: [PeopleService],
})
export class PeopleModule {}
