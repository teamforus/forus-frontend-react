import React from 'react';

export type ButtonVariant =
    | 'default'
    | 'default-dashed'
    | 'dashed'
    | 'primary'
    | 'primary-light'
    | 'primary-outline'
    | 'primary-variant'
    | 'secondary'
    | 'danger'
    | 'text'
    | 'text-primary'
    | 'text-padless';

type ButtonType = {
    text?: string;
    type?: ButtonVariant;
    icon?: string;
    iconEnd?: boolean;
    onClick: (
        e: React.MouseEvent | React.FormEvent,
        setDisabled?: React.Dispatch<React.SetStateAction<boolean>>,
    ) => void;
    className?: string;
    disableOnClick?: boolean;
};

export default ButtonType;
