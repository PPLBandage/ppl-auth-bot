import { IsNotEmpty, IsString } from 'class-validator';

export class CodeDTO {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    code: string;
}
