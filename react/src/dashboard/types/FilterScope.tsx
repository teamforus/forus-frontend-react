import { Dispatch, SetStateAction } from 'react';
import FilterSetter from './FilterSetter';

export default interface FilterScope<T> {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    values: T;
    activeValues: T;
    update: FilterSetter<Partial<T>>;
    resetFilters: () => void;
}
