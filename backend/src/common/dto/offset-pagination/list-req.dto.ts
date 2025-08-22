export class ListReqDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  order?: 'ASC' | 'DESC' = 'DESC';
  sortBy?: string = 'created_at';
  [key: string]: any;
}
