import React from 'react';

type ButtonType = {
    text?: string;
    type?: string;
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
