import {
    Body,
    Controller,
    HttpException,
    Post,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CodeDTO } from './dto/app.dto';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}

    @Post('code')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async code(@Body() body: CodeDTO) {
        if (body.token !== process.env.ACCESS_TOKEN)
            throw new HttpException({ message: `Forbidden` }, 403);

        const code = await this.prisma.codes.findFirst({
            where: { code: body.code }
        });

        if (!code) throw new HttpException({ message: 'Code not found' }, 404);

        if (new Date(code.expires).getTime() > Date.now()) {
            await this.prisma.codes.delete({ where: { id: code.id } });
            throw new HttpException({ message: 'Code not found' }, 404);
        }

        await this.prisma.codes.delete({ where: { id: code.id } });
        return {
            id: code.telegram_id,
            first_name: code.first_name,
            last_name: code.last_name,
            username: code.username,
            language_code: code.language_code
        };
    }
}
