import classNames from 'classnames';
import React from 'react';

export default function BlockLabelTabs<t = string>({
    value,
    setValue,
    tabs,
}: {
    value: t;
    setValue: (state: t) => void;
    tabs: Array<{ value: t; label: string }>;
}) {
    return (
        <div className="block block-label-tabs">
            <div className="label-tab-set">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={classNames(`label-tab label-tab-sm`, value == tab.value && 'active')}
                        onClick={() => setValue(tab.value)}>
                        {tab.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
