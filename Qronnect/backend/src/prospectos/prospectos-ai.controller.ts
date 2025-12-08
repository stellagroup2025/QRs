import { Controller, Post, Body, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ComercialAuthGuard } from '../comerciales/guards/comercial-auth.guard';
import { GeminiService } from '../ai/gemini.service';

@Controller('api/comerciales/ai')
@UseGuards(ComercialAuthGuard)
export class ProspectosAiController {
    constructor(private readonly geminiService: GeminiService) { }

    @Post('coaching')
    async getCoaching(@Body() body: any, @Res() res: Response) {
        try {
            // body: { answers, stage, lead }
            const result = await this.geminiService.generateSalesCoaching(body);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error generating coaching' });
        }
    }

    @Post('message')
    async getNeuroMessage(@Body() body: any, @Res() res: Response) {
        try {
            // body: { channel, currentStatus, targetStatus, leadName, businessName, painPoint, tone }
            const result = await this.geminiService.generateNeuroMessage(body);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error generating message' });
        }
    }
}
