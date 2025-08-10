import { HttpException, Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { GetFileResponse, GetUserProfilePhotosResponse } from './types';

const TELEGRAM_API_URL = `https://api.telegram.org`;

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    async getData(code: string) {
        const code_record = await this.prisma.codes.findFirst({
            where: { code }
        });

        if (!code_record)
            throw new HttpException({ message: 'Code not found' }, 404);

        if (new Date(code_record.expires).getTime() < Date.now()) {
            await this.prisma.codes.delete({ where: { id: code_record.id } });
            throw new HttpException({ message: 'Code expired' }, 404);
        }

        await this.prisma.codes.delete({ where: { id: code_record.id } });
        return {
            id: code_record.telegram_id,
            first_name: code_record.first_name,
            last_name: code_record.last_name,
            username: code_record.username,
            language_code: code_record.language_code
        };
    }

    async getAvatar(uid: string) {
        const response = await fetch(
            `${TELEGRAM_API_URL}/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${uid}`
        );
        if (!response.ok) throw new HttpException('Not found', 404);

        const photos: GetUserProfilePhotosResponse = await response.json();
        if (photos.result.total_count === 0)
            throw new HttpException('Not found', 404);

        const current_avatar = photos.result.photos[0].reverse()[0];
        if (!current_avatar) throw new HttpException('Not found', 404);

        const file_response = await fetch(
            `${TELEGRAM_API_URL}/bot${process.env.BOT_TOKEN}/getFile?file_id=${current_avatar.file_id}`
        );
        if (!file_response.ok) throw new HttpException('Not found', 404);
        const file_data: GetFileResponse = await file_response.json();

        const avatar_response = await fetch(
            `${TELEGRAM_API_URL}/file/bot${process.env.BOT_TOKEN}/${file_data.result.file_path}`
        );
        if (!avatar_response.ok) throw new HttpException('Not found', 404);

        return new StreamableFile(
            Buffer.from(await avatar_response.arrayBuffer()),
            { type: 'image/png' }
        );
    }
}
