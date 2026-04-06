import { Controller, Get } from '@nestjs/common';
import { SitesService } from './sites.service';
import { Public } from '../core/decorators/public.decorator';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @Public()
  getSites(): object {
    return this.sitesService.getSites();
  }
}
