import RecordTypeOption from './RecordTypeOption';
import RecordTypeOperator from './RecordTypeOperator';

export default interface RecordType {
    id: number;
    key: string;
    type: 'number' | 'string' | 'select' | 'bool' | 'date' | 'iban' | 'email' | 'select_number';
    system: boolean;
    criteria: boolean;
    name: string;
    validations: Array<'date' | 'email' | 'iban' | 'min' | 'max'>;
    options: Array<RecordTypeOption>;
    operators?: Array<RecordTypeOperator>;
}
