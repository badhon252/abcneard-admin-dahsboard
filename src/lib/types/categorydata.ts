export type CategoryWordsResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: CategoryWord[];
  meta: Meta;
};

export type CategoryWord = {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
};

export type Meta = {
  page: number;
  limit: number;
  totalCategoryWords: number;
  totalPages: number;
};