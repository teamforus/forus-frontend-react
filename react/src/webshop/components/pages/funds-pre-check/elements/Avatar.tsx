// Avatar.tsx

import React from 'react';
import type { AvatarProps } from '../../../../props/types/PrecheckChatbotTypes';

export default function Avatar({ name }: AvatarProps) {
    const className = 'flex flex-col w-fit h-fit rounded-full items-center justify-center text-black font-bold ';

    return (
        <div className={className}>
            <div className="text-3xl">{'🤖'}</div>
            <div className="text-sm">{name}</div>
        </div>
    );
}
