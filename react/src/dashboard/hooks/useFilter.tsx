import { useCallback, useEffect, useRef, useState } from 'react';
import FilterModel from '../types/FilterModel';
import FilterSetter from '../types/FilterSetter';
import FilterScope from '../types/FilterScope';

export default function useFilter<T = FilterModel>(
    defaultValues?: T & FilterModel,
    throttledValues: Array<string> = ['q'],
): FilterScope<T & FilterModel> {
    const [throttledList] = useState(throttledValues);
    const [initialValues] = useState<T & FilterModel>(defaultValues);
    const [activeValues, setActiveValues] = useState<T & FilterModel>(initialValues);
    const [values, setValues] = useState<T & FilterModel>(initialValues);
    const prevFilters = useRef(values);
    const [show, setShow] = useState(false);

    const update = useCallback<FilterSetter<Partial<T>>>(
        (values, reset = false): void => {
            if (typeof values == 'function') {
                setValues((oldValues: T) => {
                    return reset
                        ? { ...initialValues, ...(values as CallableFunction)(oldValues) }
                        : (values as CallableFunction)(oldValues);
                });

                return;
            }

            setValues((filters) => (reset ? { ...initialValues, ...values } : { ...filters, ...values }));
        },
        [initialValues],
    );

    const resetFilters = useCallback((): void => {
        update({} as T, true);
    }, [update]);

    const getTimeout = useCallback(
        (current, old) => {
            return throttledList.filter((filter) => current[filter] !== old[filter]).length > 0 ? 1000 : 0;
        },
        [throttledList],
    );

    const touch = useCallback(() => {
        update((values) => ({ ...values }));
    }, [update]);

    useEffect(
        function () {
            const clear = setTimeout(
                () => {
                    setActiveValues(values);
                },
                getTimeout(values, prevFilters.current),
            );

            return () => clearTimeout(clear);
        },
        [values, getTimeout],
    );

    useEffect(() => {
        prevFilters.current = values;
    }, [values]);

    return {
        show,
        setShow,
        values,
        activeValues,
        update,
        resetFilters,
        touch,
    };
}
