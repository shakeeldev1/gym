import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dtos/create-program.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateProgramDto } from './dtos/update-program.dto';

@Controller('training/program')
export class ProgramController {
    constructor(private readonly programService: ProgramService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    createProgram(@Body() createProgramDto: CreateProgramDto) {
        return this.programService.createProgram(createProgramDto);
    }

    @UseGuards(AuthGuard)
    @Get("all")
    getAllPrograms() {
        return this.programService.getAllPrograms();
    }

    @UseGuards(AuthGuard)
    @Get('find-one/:id')
    findOne(@Param('id') id: string) {
        return this.programService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Patch('update/:id')
    updateProgram(@Param('id') id: string, @Body() updateProgramDto: updateProgramDto) {
        return this.programService.updateProgram(id, updateProgramDto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    deleteProgram(@Param('id') id: string) {
        return this.programService.deleteProgram(id);
    }

    @UseGuards(AuthGuard)
    @Post(':id/assign/:userId')
    assignProgramToUser(@Param('id') id: string, @Param('userId') userId: string) {
        return this.programService.assignToUser(id, { assignedTo: userId });
    }
}
