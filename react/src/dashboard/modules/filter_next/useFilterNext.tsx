import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryParams, withDefault } from 'use-query-params';
import { isEqual, mapKeys, reduce } from 'lodash';
import { QueryParamConfig } from 'serialize-query-params';
import { FilterModel, FilterSetter, FilterState } from './types/FilterParams';

function appendPrefix<T = Partial<FilterModel>>(obj: object, prefix: string): T {
    return mapKeys(obj, (_, key) => prefix + key) as T;
}

function removePrefix<T = Partial<FilterModel>>(obj: object, prefix: string): T {
    return mapKeys(obj, (_, key: string) => (key.startsWith(prefix) ? key.slice(prefix.length) : key)) as T;
}

export default function useFilterNext<T = FilterModel>(
    defaultValues?: Partial<T & FilterModel>,
    options?: {
        queryParams?: Partial<Record<keyof T, QueryParamConfig<number | string | boolean | object>>>;
        queryParamsPrefix?: string;
        queryParamsRemoveDefault?: boolean;
        transform?: (values: Partial<T & FilterModel>) => Partial<T & FilterModel>;
        filterParams?: Array<keyof T>;
        throttledValues?: Array<keyof T>;
    },
): FilterState<T> {
    const [queryParamsRemoveDefault] = useState(options?.queryParamsRemoveDefault || true);
    const [queryParamsPrefix] = useState(options?.queryParamsPrefix || '');
    const [queryParams] = useState(options?.queryParams ? appendPrefix(options?.queryParams, queryParamsPrefix) : null);

    const [filterParams] = useState(options?.filterParams || null);
    const [initialValues] = useState(appendPrefix(defaultValues, queryParamsPrefix));

    const [throttledValues] = useState<Array<keyof T>>(options?.throttledValues || (['q'] as Array<keyof T>));
    const [backendTypeQuery] = useState(!!queryParams);

    const [queryParamsWithDefaults] = useState(
        reduce(
            queryParams,
            (params, value, key: string) => {
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
    const stateValuesRef = useRef(stateValues);
    const querySyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [combinedInitialValues] = useState({
        ...initialValues,
        ...(backendTypeQuery ? initialQueryValues : {}),
    });

    const [activeValues, setActiveValues] = useState<Partial<T & FilterModel>>({
        ...Object.keys(combinedInitialValues)
            .filter((key) => !filterParams || !filterParams.includes(key as keyof T))
            .reduce((obj, key) => ({ ...obj, [key]: combinedInitialValues[key] }), {}),
    });

    const values = useMemo<T & FilterModel>(() => {
        return stateValues as T & FilterModel;
    }, [stateValues]);

    const _values = useMemo(
        () => removePrefix<Partial<T & FilterModel>>(values, queryParamsPrefix),
        [queryParamsPrefix, values],
    );

    const _activeValues = useMemo(
        () => removePrefix<Partial<T & FilterModel>>(activeValues, queryParamsPrefix),
        [activeValues, queryParamsPrefix],
    );

    const prevFilters = useRef(stateValues);

    const pickQueryValues = useCallback(
        (filters: Partial<T & FilterModel>): Partial<T & FilterModel> => {
            if (!queryParams) {
                return filters;
            }

            return Object.keys(queryParams).reduce(
                (obj, key) => ({ ...obj, [key]: filters[key] }),
                {} as Partial<T & FilterModel>,
            );
        },
        [queryParams],
    );

    const update = useCallback<FilterSetter<Partial<T>>>(
        (values, reset = false): void => {
            const throttled =
                Object.keys(values).filter((key) => {
                    return throttledValues && throttledValues.includes(key as keyof T) && values[key] !== '';
                }).length > 0;

            const callbackSetter = (filters: Partial<T & FilterModel>): Partial<T & FilterModel> => {
                if (reset) {
                    return {
                        ...initialValues,
                        ...appendPrefix(
                            (values as CallableFunction)(removePrefix(filters, queryParamsPrefix)),
                            queryParamsPrefix,
                        ),
                    };
                }

                return {
                    ...{},
                    ...appendPrefix(
                        (values as CallableFunction)(removePrefix(filters, queryParamsPrefix)),
                        queryParamsPrefix,
                    ),
                };
            };

            const valueSetter = (filters: Partial<T & FilterModel>): Partial<T & FilterModel> => {
                return reset
                    ? { ...filters, ...initialValues, ...appendPrefix(values, queryParamsPrefix) }
                    : { ...filters, ...appendPrefix(values, queryParamsPrefix) };
            };

            const nextValues =
                typeof values == 'function'
                    ? callbackSetter(stateValuesRef.current)
                    : valueSetter(stateValuesRef.current);

            stateValuesRef.current = nextValues;
            setValues(nextValues);

            if (!backendTypeQuery) {
                return;
            }

            if (querySyncTimeoutRef.current) {
                clearTimeout(querySyncTimeoutRef.current);
            }

            querySyncTimeoutRef.current = setTimeout(() => {
                querySyncTimeoutRef.current = null;
                setValuesQuery(pickQueryValues(nextValues), throttled ? 'replaceIn' : 'pushIn');
            });
        },
        [backendTypeQuery, initialValues, setValuesQuery, throttledValues, queryParamsPrefix, pickQueryValues],
    );

    const resetFilters = useCallback((): void => {
        update({} as T, true);
    }, [update]);

    const getTimeout = useCallback(
        (current: Partial<T & FilterModel>, old: Partial<T & FilterModel>) => {
            const throttledKeys = throttledValues.filter(
                (filter: keyof T | string) =>
                    removePrefix(current, queryParamsPrefix)[filter as string] !==
                    removePrefix(old, queryParamsPrefix)[filter as string],
            );

            return throttledKeys.length > 0 ? 1000 : 0;
        },
        [throttledValues, queryParamsPrefix],
    );

    const touch = useCallback(() => {
        update((values) => ({ ...values }));
    }, [update]);

    useEffect(() => {
        update(removePrefix({ ...initialValues, ...initialQueryValues }, queryParamsPrefix));
    }, [initialValues, initialQueryValues, update, queryParamsPrefix]);

    useEffect(() => {
        if (!backendTypeQuery || querySyncTimeoutRef.current) {
            return;
        }

        setValues((currentValues) => {
            const nextValues = { ...currentValues, ...queryValues };

            if (isEqual(pickQueryValues(currentValues), pickQueryValues(nextValues))) {
                return currentValues;
            }

            stateValuesRef.current = nextValues;
            return nextValues;
        });
    }, [backendTypeQuery, pickQueryValues, queryValues]);

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
        [values, getTimeout, filterParams],
    );

    useEffect(() => {
        stateValuesRef.current = values;
        prevFilters.current = values;
    }, [values]);

    useEffect(() => {
        return () => {
            if (querySyncTimeoutRef.current) {
                clearTimeout(querySyncTimeoutRef.current);
            }
        };
    }, []);

    return [
        _values,
        _activeValues,
        update,
        {
            show,
            setShow,
            values: _values,
            activeValues: _activeValues,
            update,
            resetFilters,
            touch,
        },
    ];
}
