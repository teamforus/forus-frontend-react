import { AnswerOption, SlotSummaryItem } from '../types/PrecheckChatbotTypes';

export default interface ApiMessage {
    seq?: number;
    type: 'user' | 'ai';
    text: string;
    sender?: string;
    answer_options?: AnswerOption[];
    input_type?: string;
    answered?: boolean;
    step?: string;
    in_progress?: boolean;
    selected_answer?: AnswerOption;
    slots?: SlotSummaryItem[];
    error?: boolean;
}
