export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
  success?: boolean;
  redirect?: string;
}

export type FormErrorOptions<T> = {
  userMessage?: string;
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  details?: string;
};

export type ActionErrorOptions = Omit<FormErrorOptions<unknown>, "fieldError">;
