import FilterModel from './FilterModel';

type FilterSetter<T = FilterModel> = (values: T | ((values: T) => T), reset?: boolean) => void;

export default FilterSetter;
