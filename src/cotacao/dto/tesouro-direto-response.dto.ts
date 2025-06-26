export interface TesouroDiretoResponseDto {
  responseStatus: number;
  responseStatusText: string;
  statusInfo: string;
  response: ResponseDto;
}

export interface ResponseDto {
  TrsrBdTradgList: TreasureBondTradeList[];
  TrsrBondMkt: TreasureBondMarketDto;
}

export interface TreasureBondTradeList {
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
