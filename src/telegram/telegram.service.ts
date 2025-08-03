import { Injectable } from '@nestjs/common';
import { Markup, Telegraf, type Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from 'telegraf/types';

@Injectable()
export class TelegramService {
    private bot: Telegraf;

    constructor(private prisma: PrismaService) {
        this.bot = new Telegraf(process.env.BOT_TOKEN as string);
    }

    async createLoginData(user: User) {
        const lifetime = parseInt(process.env.TOKEN_LIFETIME as string);

        const record = await this.prisma.codes.create({
            data: {
                code: Math.random().toString(36).substring(2),
                telegram_id: user.id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code,

                expires: new Date(new Date().getTime() + lifetime * 1000)
            }
        });

        return record;
    }

    async sendPlaceholder(ctx: Context) {
        const text =
            `*Поддержка Телеграм бота была завершена 2 июня 2024.*\n` +
            `Вместо этого используйте сайт: https://pplbandage.ru`;

        await ctx.reply(text, {
            parse_mode: 'Markdown'
        });
    }

    getBaseHelloText(ctx: Context) {
        return (
            `*Привет, ${ctx.from?.first_name}*👋\n` +
            `Для продолжения нажми кнопку ниже`
        );
    }

    async precessLogin(ctx: Context, code: string) {
        const redirect_uri = `https://pplbandage.ru/me/login/telegram`;

        const keyboard = Markup.inlineKeyboard([
            Markup.button.url(
                `Войти как ${ctx.from?.first_name}`,
                `${redirect_uri}?code=${code}`
            )
        ]);

        await ctx.reply(this.getBaseHelloText(ctx), {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
        });
    }

    async precessConnect(ctx: Context, code: string) {
        const redirect_uri = `https://pplbandage.ru/me/connect/telegram`;

        const keyboard = Markup.inlineKeyboard([
            Markup.button.url(
                `Подключить аккаунт ${ctx.from?.first_name}`,
                `${redirect_uri}?code=${code}`
            )
        ]);

        await ctx.reply(this.getBaseHelloText(ctx), {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
        });
    }

    launchBot() {
        this.bot.start(async ctx => {
            const action = ctx.payload;

            if (!action) {
                await this.sendPlaceholder(ctx);
                return;
            }

            const data = await this.createLoginData(ctx.from);
            if (action === 'connect') {
                await this.precessConnect(ctx, data.code);
                return;
            }

            await this.precessLogin(ctx, data.code);
        });

        this.bot.launch();
        console.log('Telegram bot launched!');
    }
}
