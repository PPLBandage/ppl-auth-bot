import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClearanceScheduler {
    constructor(private readonly prismaService: PrismaService) {}

    @Cron('0 */10 * * * *')
    async scheduleCodeClearance() {
        const { count } = await this.prismaService.codes.deleteMany({
            where: { expires: { lte: new Date() } }
        });

        console.info(`Deleted ${count} unused codes`);
    }
}
