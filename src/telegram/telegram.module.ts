import { Module, OnModuleInit } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClearanceScheduler } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    providers: [TelegramService, PrismaService, ClearanceScheduler],
    imports: [ScheduleModule.forRoot()]
})
export class TelegramModule implements OnModuleInit {
    constructor(private readonly telegramService: TelegramService) {}

    onModuleInit() {
        this.telegramService.launchBot();
    }
}
