export class PaginatedDto<T> {
  constructor(content: T[], totalRecords: number, skip: number, take: number) {
    this.content = content;
    this.metadata = new Metadata(totalRecords, skip, take ?? totalRecords);
  }

  content: T[];
  metadata: Metadata;
}

export class Metadata {
  constructor(totalRecords: number, skip: number, take: number) {
    this.totalRecords = totalRecords;
    this.skip = skip;
    this.take = take;
  }

  skip: number;
  take: number;
  totalRecords: number;
}
