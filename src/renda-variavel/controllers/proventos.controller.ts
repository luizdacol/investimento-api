import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProventosService } from '../services/proventos.service';
import { CreateProventoDto } from '../dto/create-provento.dto';
import { UpdateProventoDto } from '../dto/update-provento.dto';
import { Provento } from '../entities/provento.entity';
import { FindProventosParamsDto } from '../dto/find-proventos-params.dto';
import { PaginatedDto } from '../dto/paginated.dto';

@Controller('v1/renda-variavel/proventos')
export class ProventosController {
  constructor(private readonly proventosService: ProventosService) {}

  @Post()
  create(@Body() createProventoDto: CreateProventoDto) {
    console.log('[POST][Proventos] Incoming request: ', createProventoDto);
    return this.proventosService.create(createProventoDto);
  }

  @Get()
  async findAll(
    @Query() params: FindProventosParamsDto,
  ): Promise<PaginatedDto<Provento>> {
    const sortBy = params.parseSortBy();

    return this.proventosService.findAll(
      undefined,
      sortBy,
      params.skip,
      params.take,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Provento> {
    return this.proventosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProventoDto: UpdateProventoDto,
  ) {
    console.log('[PATCH][Proventos] Incoming request: ', updateProventoDto);
    return this.proventosService.update(+id, updateProventoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return this.proventosService.remove(+id);
  }
}
