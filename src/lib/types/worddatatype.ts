export type WordManagementResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: WordManagement[];
  meta: Meta;
};

export type WordManagement = {
  _id: string;
  word: string;
  synonyms: string[];
  description: string;
  pronunciation: string;
  examples: string[];
  categoryWordId: string;
  categoryType: string;
  wordType: string;
  partOfSpeech: string;
  frequency: number;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
};

export type Meta = {
  page: number;
  limit: number;
  totalPage: number;
  totalWordmanagements: number;
};