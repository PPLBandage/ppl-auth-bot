import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { AppService } from './app.service';

@Module({
    imports: [PrismaModule, TelegramModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
