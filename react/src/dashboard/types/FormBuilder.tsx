import FormSetter from './FormSetter';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import FormValuesModel from './FormValuesModel';

export default interface FormBuilder<T = FormValuesModel> {
    values: T | null;
    update: FormSetter<Partial<T>>;
    submit: (e?: FormEvent<HTMLFormElement>) => void;
    isLocked: boolean;
    setIsLocked: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    state: 'pending' | 'error' | 'success' | string;
    setState: (state: 'pending' | 'error' | 'success' | string) => void;
    errors: { [key: string]: Array<string> };
    setErrors: Dispatch<SetStateAction<{ [key: string]: Array<string> }>>;
    reset: () => void;
}
