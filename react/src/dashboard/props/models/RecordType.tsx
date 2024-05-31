import RecordTypeOption from './RecordTypeOption';
import RecordTypeOperator from './RecordTypeOperator';

export default interface RecordType {
    id: number;
    key: string;
    type: 'number' | 'string' | 'select' | 'bool' | 'date' | 'iban' | 'email' | 'select_number';
    system: boolean;
    name: string;
    options: Array<RecordTypeOption>;
    operators?: Array<RecordTypeOperator>;
}
