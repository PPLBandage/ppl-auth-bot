import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
    imports: [PrismaModule, TelegramModule],
    controllers: [AppController],
    providers: []
})
export class AppModule {}
