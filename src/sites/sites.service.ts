import { Injectable } from '@nestjs/common';
import { siteDefiner } from '../crawler/crawler.definer';

@Injectable()
export class SitesService {
  getSites(): object {
    const sites = Object.entries(siteDefiner).map(([key, config]) => ({
      name: key,
      url: config.url,
      engine: config.engine,
    }));

    return { data: sites };
  }
}
