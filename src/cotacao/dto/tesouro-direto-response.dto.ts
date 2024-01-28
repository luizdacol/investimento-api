export interface TesouroDiretoResponseDto {
  responseStatus: number;
  responseStatusText: string;
  statusInfo: string;
  response: ResponseDto;
}

export interface ResponseDto {
  TrsrBd: TreasureBondDto;
  TrsrBondMkt: TreasureBondMarketDto;
}

export interface TreasureBondDto {
  cd: number;
  nm: string;
  mtrtyDt: string;
  featrs: string;
  invstmtStbl: string;
  rcvgIncm: string;
  wdwlDt: string;
  Pricg: PrcgLstDto;
}

export interface PrcgLstDto {
  untrInvstmtVal: number;
  anulInvstmtRate: number;
  untrRedVal: number;
  anulRedRate: number;
}

export interface TreasureBondMarketDto {
  sts: string;
  qtnDtTm: string;
  opngDtTm: string;
  clsgDtTm: string;
}
