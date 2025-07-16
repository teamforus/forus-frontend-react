import FormSetter from './FormSetter';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import FormValuesModel from './FormValuesModel';
import { ResponseErrorData } from '../props/ApiResponses';

export default interface FormBuilder<T = FormValuesModel> {
    values: T | null;
    update: FormSetter<Partial<T>>;
    setValues: FormSetter<Partial<T>>;
    submit: (e?: FormEvent<HTMLFormElement>, data?: unknown) => void;
    isLocked: boolean;
    setIsLocked: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    state: 'pending' | 'error' | 'success' | string;
    setState: (state: 'pending' | 'error' | 'success' | string) => void;
    errors: ResponseErrorData;
    setErrors: Dispatch<SetStateAction<{ [key: string]: string | Array<string> }>>;
    reset: () => void;
}
