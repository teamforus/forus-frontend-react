import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function FormPaneContainer({
    children,
    className,
}: {
    children: ReactNode | ReactNode[];
    className?: string;
}) {
    return <div className={classNames(className, 'flex flex-vertical flex-gap-xl')}>{children}</div>;
}
