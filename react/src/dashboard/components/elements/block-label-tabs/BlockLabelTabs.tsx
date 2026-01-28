import classNames from 'classnames';
import React from 'react';

export default function BlockLabelTabs<t = string>({
    value,
    setValue,
    tabs,
    size = 'sm',
}: {
    value: t;
    setValue: (state: t) => void;
    tabs: Array<{ value: t; label: React.ReactNode; dusk?: string }>;
    size?: 'sm' | null;
}) {
    return (
        <div className="block block-label-tabs">
            <div className="label-tab-set">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        data-dusk={tab.dusk}
                        className={classNames(
                            'label-tab',
                            size === 'sm' && 'label-tab-sm',
                            value == tab.value && 'active',
                        )}
                        onClick={() => setValue(tab.value)}>
                        {tab.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
