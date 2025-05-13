import React, { ReactNode } from 'react';

export default function EmptyValue({ children = '---' }: { children?: ReactNode | ReactNode[] }) {
    return <div className={'text-default text-muted'}>{children}</div>;
}
