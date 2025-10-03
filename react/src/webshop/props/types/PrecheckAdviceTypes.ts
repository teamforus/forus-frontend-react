// props.tsx
// Type definitions for component props used across precheck advice UI.

export type Advice = {
    scheme: string;
    description: string;
    chance: number;
    label: 'laag' | 'midden' | 'hoog';
    explanation: string;
    per_condition: string[];
};

export type AdviceCircleProps = {
    percentage: number;
    className?: string;
};

export type AdviceCardExplanationButtonProps = {
    show: boolean;
    toggle: () => void;
};

export type AdviceCardScoreProps = {
    chance: number;
    label: string;
};

export type AdviceCardDescriptionProps = {
    title: string;
    description: string;
};
