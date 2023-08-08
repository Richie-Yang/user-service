import { Module } from '@nestjs/common';
import * as controllers from './controllers';
import * as services from './services';
import * as repositories from './repositories';

@Module({
  imports: [],
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services), ...Object.values(repositories)],
})
export class AppModule {}
