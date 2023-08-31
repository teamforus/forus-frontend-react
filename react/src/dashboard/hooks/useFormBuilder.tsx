import { FormEvent, useCallback, useMemo, useState } from 'react';
import FormValuesModel from '../types/FormValuesModel';
import FormSetter from '../types/FormSetter';
import FormSubmitter from '../types/FormSubmitter';
import FormBuilder from '../types/FormBuilder';

export default function useFormBuilder<T = FormValuesModel>(
    initialValues: T | null,
    onSubmit: FormSubmitter<T> | false,
): FormBuilder<T> {
    const [values, setValues] = useState<T | null>(initialValues);
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<'pending' | 'error' | 'success' | string>('pending');
    const [errors, setErrors] = useState<{ [key: string]: Array<string> }>({});

    const reset = useCallback(() => {
        setValues(initialValues);
        setState('pending');
        setErrors({});
        setIsLoading(false);
        setIsLocked(false);
    }, [initialValues]);

    const submit = useCallback<(e?: FormEvent<HTMLFormElement>) => void>(
        (e = null): void => {
            e?.preventDefault();

            if (isLocked || !onSubmit) {
                return;
            }

            setIsLocked(true);
            setIsLoading(true);

            const result = onSubmit(values, e);

            if (result) {
                result.finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        },
        [values, isLocked, onSubmit],
    );

    const update = useCallback<FormSetter<Partial<T>>>((values: T | ((values: T) => T)): void => {
        setValues((oldValues) => ({ ...oldValues, ...values }));
    }, []);

    return useMemo(
        () => ({
            values,
            update,
            submit,
            isLocked,
            setIsLocked,
            isLoading,
            setIsLoading,
            state,
            setState,
            errors,
            setErrors,
            reset,
        }),
        [errors, isLoading, isLocked, reset, state, submit, update, values],
    );
}
