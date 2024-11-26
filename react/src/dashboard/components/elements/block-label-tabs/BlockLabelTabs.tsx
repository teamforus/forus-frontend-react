import classNames from 'classnames';
import React from 'react';

export default function BlockLabelTabs({
    value,
    setValue,
    tabs,
}: {
    value: string;
    setValue: (state: string) => void;
    tabs: Array<{ value: string; label: string }>;
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
