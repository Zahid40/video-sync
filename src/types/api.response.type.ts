export type ApiResponseType<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
};