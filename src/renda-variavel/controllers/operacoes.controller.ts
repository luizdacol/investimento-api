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
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { Operacao } from '../entities/operacao.entity';
import { TaxasNegociacaoDto } from '../dto/taxas-negociacao.dto';
import { FindOperationsParamsDto } from '../dto/find-operations-params.dto';
import { PaginatedDto } from '../dto/paginated.dto';
import { parseFilterBy, parseSortBy } from '../../utils/helper';
import { LucrosPrejuizosDto } from '../dto/lucros-prejuizos.dto';

@Controller('v1/renda-variavel/operacoes')
@UseInterceptors(ClassSerializerInterceptor)
export class OperacoesController {
  constructor(private readonly rendaVariavelService: OperacoesService) {}

  @Post()
  create(@Body() createRendaVariavelDto: CreateOperacaoDto) {
    console.log('[POST][Operacoes] Incoming request: ', createRendaVariavelDto);
    return this.rendaVariavelService.create(createRendaVariavelDto);
  }

  @Get()
  findAll(
    @Query() params: FindOperationsParamsDto,
  ): Promise<PaginatedDto<Operacao>> {
    const sortBy = parseSortBy(params.sortBy);
    const filterBy = parseFilterBy(params.filterBy);

    return this.rendaVariavelService.findAll(
      filterBy,
      sortBy,
      params.skip,
      params.take,
    );
  }

  @Get('taxas-impostos')
  async obterTaxas(): Promise<TaxasNegociacaoDto[]> {
    const { content: operacoes } = await this.rendaVariavelService.findAll();

    return this.rendaVariavelService.calcularTaxas(operacoes);
  }

  @Get('lucros-prejuizos')
  async obterLucrosPrejuizos(): Promise<LucrosPrejuizosDto[]> {
    return this.rendaVariavelService.getLucrosPrejuizosPorClasse();
  }

  @Patch('lucros-prejuizos/:id')
  async atualizarPrejuizoCompensar(
    @Param('id') id: number,
    @Body() updatePrejuizo: { prejuizoCompensado: number },
  ): Promise<boolean> {
    return this.rendaVariavelService.updatePrejuizoCompensado(
      id,
      updatePrejuizo.prejuizoCompensado,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Operacao> {
    return this.rendaVariavelService.findOne(+id);
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
    return this.rendaVariavelService.update(+id, updateRendaVariavelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.rendaVariavelService.remove(+id);
  }
}
