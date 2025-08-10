import {
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CodeDTO } from './dto/app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('code')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async code(@Body() body: CodeDTO) {
        if (body.token !== process.env.ACCESS_TOKEN)
            throw new HttpException({ message: `Forbidden` }, 403);

        return await this.appService.getData(body.code);
    }

    @Get('avatar/:uid')
    async avatar(@Param('uid') uid: string) {
        return await this.appService.getAvatar(uid);
    }
}
