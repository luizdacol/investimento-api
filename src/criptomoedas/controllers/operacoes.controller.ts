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
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { OperacoesService } from '../services/operacoes.service';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { Operacao } from '../entities/operacao.entity';
import { parseFilterBy, parseSortBy } from '../../utils/helper';
import { FindOperationsParamsDto } from '../dto/find-operations-params.dto';
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { PaginatedDto } from '../dto/paginated.dto';

@Controller('v1/criptomoedas/operacoes')
@UseInterceptors(ClassSerializerInterceptor)
export class OperacoesController {
  constructor(private readonly operationService: OperacoesService) {}

  @Post()
  create(@Body() createRendaVariavelDto: CreateOperacaoDto) {
    console.log('[POST][Operacoes] Incoming request: ', createRendaVariavelDto);
    return this.operationService.create(createRendaVariavelDto);
  }

  @Get()
  findAll(
    @Query() params: FindOperationsParamsDto,
  ): Promise<PaginatedDto<Operacao>> {
    const sortBy = parseSortBy(params.sortBy);
    const filterBy = parseFilterBy(params.filterBy);

    return this.operationService.findAll(
      filterBy,
      sortBy,
      params.skip,
      params.take,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Operacao> {
    return this.operationService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRendaVariavelDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    console.log(
      '[PATCH][Operacoes] Incoming request: ',
      updateRendaVariavelDto,
    );
    return this.operationService.update(+id, updateRendaVariavelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.operationService.remove(+id);
  }
}
