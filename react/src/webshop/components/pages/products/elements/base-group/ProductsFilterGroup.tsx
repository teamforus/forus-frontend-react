import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';

export default function ProductsFilterGroup({
    dusk,
    title,
    content,
    controls,
    openByDefault = false,
}: {
    dusk?: string;
    title?: string;
    content?: (isOpen: boolean, setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>) => ReactNode | ReactNode[];
    controls?: string;
    openByDefault?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(openByDefault);

    return (
        <div className={classNames('showcase-aside-group', isOpen && 'showcase-aside-group-open')} data-dusk={dusk}>
            <h3 className="showcase-aside-group-title">
                <button
                    type="button"
                    className="showcase-aside-group-title-toggle"
                    aria-expanded={isOpen}
                    aria-controls={controls}
                    onClick={() => setIsOpen((prev) => !prev)}>
                    {title}
                    <span
                        aria-hidden="true"
                        className={classNames(
                            'showcase-aside-group-title-toggle-icon',
                            isOpen
                                ? 'showcase-aside-group-title-toggle-icon-open'
                                : 'showcase-aside-group-title-toggle-icon-closed',
                        )}>
                        <em className="mdi mdi-menu-down" />
                    </span>
                </button>
            </h3>

            {content(isOpen, setIsOpen)}
        </div>
    );
}
