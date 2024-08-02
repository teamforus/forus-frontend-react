import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryParams, withDefault } from 'use-query-params';
import { isEqual, reduce } from 'lodash';
import { QueryParamConfig } from 'serialize-query-params';
import { FilterModel, FilterSetter, FilterState } from './types/FilterParams';

export default function useFilterNext<T = FilterModel>(
    defaultValues?: Partial<T & FilterModel>,
    options?: {
        queryParams?: Partial<Record<keyof T, QueryParamConfig<number | string | boolean | object>>>;
        queryParamsRemoveDefault?: boolean;
        transform?: (values: Partial<T & FilterModel>) => Partial<T & FilterModel>;
        filterParams?: Array<keyof T>;
        throttledValues?: Array<keyof T>;
    },
): FilterState<T> {
    const [{ queryParams, filterParams, throttledValues, queryParamsRemoveDefault }] = useState({
        queryParams: null,
        filterParams: null,
        throttledValues: ['q'] as Array<keyof T>,
        queryParamsRemoveDefault: true,
        ...(options || {}),
    });

    const [backendTypeQuery] = useState(!!queryParams);
    const [initialValues] = useState(defaultValues);

    const [queryParamsWithDefaults] = useState(
        reduce(
            queryParams,
            (params, value, key) => {
                return Object.keys(initialValues).includes(key)
                    ? { ...params, [key]: withDefault(value as never, initialValues[key], true) }
                    : { ...params, [key]: value };
            },
            {},
        ),
    );

    const [queryValues, setValuesQuery] = useQueryParams(queryParamsWithDefaults, {
        removeDefaultsFromUrl: queryParamsRemoveDefault,
    });

    const [initialQueryValues] = useState(
        reduce(
            queryValues,
            (obj, value, key) => {
                return value !== undefined ? { ...obj, [key]: value } : obj;
            },
            {},
        ),
    );

    const [show, setShow] = useState(false);

    const [stateValues, setValues] = useState<Partial<T & FilterModel>>({ ...initialValues, ...initialQueryValues });

    const [activeValues, setActiveValues] = useState<Partial<T & FilterModel>>({
        ...initialValues,
        ...(backendTypeQuery ? initialQueryValues : {}),
    });

    const prevFilters = useRef(backendTypeQuery ? queryValues : stateValues);

    const values = useMemo<T & FilterModel>(() => {
        return (backendTypeQuery ? queryValues : stateValues) as T & FilterModel;
    }, [queryValues, stateValues, backendTypeQuery]);

    const update = useCallback<FilterSetter<Partial<T>>>(
        (values, reset = false): void => {
            const throttled =
                Object.keys(values).filter((key) => {
                    return throttledValues && throttledValues.includes(key as keyof T) && values[key] !== '';
                }).length > 0;

            if (typeof values == 'function') {
                if (backendTypeQuery) {
                    return setValuesQuery(
                        (oldValues) => {
                            return reset
                                ? { ...initialValues, ...(values as CallableFunction)(oldValues) }
                                : (values as CallableFunction)(oldValues);
                        },
                        throttled ? 'replaceIn' : 'pushIn',
                    );
                }

                return setValues((oldValues: Partial<T>) => {
                    return reset
                        ? { ...initialValues, ...(values as CallableFunction)(oldValues) }
                        : (values as CallableFunction)(oldValues);
                });
            }

            if (backendTypeQuery) {
                return setValuesQuery(
                    (filters) => {
                        return reset ? { ...filters, ...initialValues, ...values } : { ...filters, ...values };
                    },
                    throttled ? 'replaceIn' : 'pushIn',
                );
            }

            setValues((filters) => (reset ? { ...initialValues, ...values } : { ...filters, ...values }));
        },
        [backendTypeQuery, initialValues, setValuesQuery, throttledValues],
    );

    const resetFilters = useCallback((): void => {
        update({} as T, true);
    }, [update]);

    const getTimeout = useCallback(
        (current, old) => {
            return throttledValues.filter((filter: keyof T | string) => current[filter] !== old[filter]).length > 0
                ? 1000
                : 0;
        },
        [throttledValues],
    );

    const touch = useCallback(() => {
        update((values) => ({ ...values }));
    }, [update]);

    useEffect(() => {
        update({ ...initialValues, ...initialQueryValues });
    }, [initialValues, initialQueryValues, update]);

    useEffect(
        function () {
            const clear = setTimeout(
                () => {
                    const data = values;
                    const dataReady = Object.keys(data).filter(
                        (key) => !filterParams || !filterParams.includes(key as keyof T),
                    );
                    const newValues = dataReady.reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});

                    setActiveValues((oldValues) => {
                        return isEqual(oldValues, newValues) ? oldValues : newValues;
                    });
                },
                getTimeout(values, prevFilters.current),
            );

            return () => clearTimeout(clear);
        },
        [values, getTimeout, backendTypeQuery, queryValues, filterParams],
    );

    useEffect(() => {
        prevFilters.current = values;
    }, [values]);

    return [
        values,
        activeValues,
        update,
        {
            show,
            setShow,
            values,
            activeValues,
            update,
            resetFilters,
            touch,
        },
    ];
}
