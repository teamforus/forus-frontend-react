// Avatar.tsx

import React from 'react';
import type { AvatarProps } from '../../../../props/types/PrecheckChatbotTypes';

export default function Avatar({ name }: AvatarProps) {
    return (
        <div className="message-avatar">
            <div className="avatar-icon">{'🤖'}</div>
            <div className="avatar-name">{name}</div>
        </div>
    );
}
