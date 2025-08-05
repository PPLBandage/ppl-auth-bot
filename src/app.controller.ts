import {
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    StreamableFile,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CodeDTO } from './dto/app.dto';
import { GetFileResponse, GetUserProfilePhotosResponse } from './types';

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

        if (new Date(code.expires).getTime() < Date.now()) {
            await this.prisma.codes.delete({ where: { id: code.id } });
            throw new HttpException({ message: 'Code expired' }, 404);
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

    @Get('avatar/:uid')
    async avatar(@Param('uid') uid: string) {
        const response = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${uid}`
        );
        if (!response.ok) throw new HttpException('Not found', 404);

        const photos: GetUserProfilePhotosResponse = await response.json();
        if (photos.result.total_count === 0)
            throw new HttpException('Not found', 404);

        const current_avatar = photos.result.photos[0].reverse()[0];
        if (!current_avatar) throw new HttpException('Not found', 404);

        const file_response = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${current_avatar.file_id}`
        );
        if (!file_response.ok) throw new HttpException('Not found', 404);
        const file_data: GetFileResponse = await file_response.json();

        const avatar_response = await fetch(
            `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file_data.result.file_path}`
        );
        if (!avatar_response.ok) throw new HttpException('Not found', 404);

        return new StreamableFile(
            Buffer.from(await avatar_response.arrayBuffer()),
            { type: 'image/png' }
        );
    }
}
