export type Requirement = 'no' | 'optional' | 'required';

export interface ClarificationFormValues {
    text_requirement: Requirement;
    files_requirement: Requirement;
    question: string;
    notify_requester: boolean;
}
