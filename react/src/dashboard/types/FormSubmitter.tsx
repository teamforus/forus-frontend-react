import { FormEvent } from 'react';

type FormSubmitter<T> = (values: T, e?: FormEvent<HTMLFormElement>) => Promise<unknown> | null | void;

export default FormSubmitter;
