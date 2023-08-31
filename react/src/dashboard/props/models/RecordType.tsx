export default interface RecordType {
    id: number;
    key: string;
    type: 'number' | 'string';
    system: boolean;
    name: string;
}
