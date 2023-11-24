export interface TesouroDiretoResponseDto {
  responseStatus: number;
  responseStatusText: string;
  statusInfo: string;
  response: ResponseDto;
}

export interface ResponseDto {
  TrsrBd: TreasureBondDto;
}

export interface TreasureBondDto {
  cd: number;
  nm: string;
  mtrtyDt: string;
  featrs: string;
  invstmtStbl: string;
  rcvgIncm: string;
  wdwlDt: string;
  PrcgLst: PrcgLstDto[];
}

export interface PrcgLstDto {
  TrsrBdMkt: TreasureBondMarketDto;
  untrInvstmtVal: number;
  anulInvstmtRate: number;
  untrRedVal: number;
  anulRedRate: number;
}

export interface TreasureBondMarketDto {
  opngDtTm: string;
  clsgDtTm: string;
}
