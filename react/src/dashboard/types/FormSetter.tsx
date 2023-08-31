type FormSetter<T> = (values: T | ((values: T) => T)) => void;

export default FormSetter;
