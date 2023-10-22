export class DateTransformer {
  to(data: Date): Date {
    data.setUTCHours(12); //Gambeta pra gravar a data correta no banco
    return data;
  }
  from(data: string): Date {
    return new Date(data);
  }
}
