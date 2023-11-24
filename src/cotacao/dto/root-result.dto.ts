export interface RootResultDto<T> {
  results: T[];
  requestedAt: string;
  took: string;
}
