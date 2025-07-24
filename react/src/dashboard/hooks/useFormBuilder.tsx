import { FormEvent, useCallback, useMemo, useState } from 'react';
import FormValuesModel from '../types/FormValuesModel';
import FormSetter from '../types/FormSetter';
import FormSubmitter from '../types/FormSubmitter';
import FormBuilder from '../types/FormBuilder';

export default function useFormBuilder<T = FormValuesModel, D = unknown>(
    initialValues: T | null,
    onSubmit: FormSubmitter<T, D> | false,
): FormBuilder<T> {
    const [initValues] = useState(initialValues);
    const [values, setValues] = useState<T | null>(initValues);
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<'pending' | 'error' | 'success' | string>('pending');
    const [errors, setErrors] = useState<{ [key: string]: Array<string> }>({});

    const reset = useCallback(() => {
        setValues(initValues);
        setState('pending');
        setErrors({});
        setIsLoading(false);
        setIsLocked(false);
    }, [initValues]);

    const submit = useCallback<(e?: FormEvent<HTMLFormElement>, data?: D) => void>(
        (e = null, data): void => {
            e?.preventDefault();

            if (isLocked || !onSubmit) {
                return;
            }

            setIsLocked(true);
            setIsLoading(true);

            const result = onSubmit(values, e, data);

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
            setValues,
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
