import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Campus Arena API v1 running';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'campus-arena-api',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
