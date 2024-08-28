import React from 'react';
import useTranslate from '../../../hooks/useTranslate';

export default function TableConfig({
    settingsRef,
    selectedCategory,
    tooltips,
    activeTooltipKey,
    setSelectedCategory,
    onClose,
}: {
    settingsRef?: React.MutableRefObject<HTMLDivElement>;
    selectedCategory: string;
    tooltips: Array<{ key: string; title: string; description: string }>;
    setSelectedCategory: (category: string) => void;
    activeTooltipKey: string;
    onClose?: () => void;
}) {
    const translate = useTranslate();

    return (
        <div className={`block block-table-settings`} ref={settingsRef}>
            <div className="table-settings-close" onClick={onClose}>
                <em className="mdi mdi-close" />
            </div>

            <div className="table-settings-list">
                <div
                    className={`table-setting ${selectedCategory == 'tooltips' ? 'active' : ''} ${
                        !tooltips.length ? 'disabled' : ''
                    }`}
                    onClick={() => setSelectedCategory('tooltips')}>
                    <em className="mdi mdi-information-variant-circle" />
                    <div className="table-setting-name">Kolombeschrijvingen</div>
                </div>
            </div>

            <div className="table-settings-details-block">
                {selectedCategory == 'tooltips' && (
                    <div className="table-settings-tooltip-list">
                        {tooltips.map((tooltip, index) => (
                            <div
                                className={`table-settings-tooltip-item ${
                                    tooltip.key == activeTooltipKey ? 'active' : ''
                                }`}
                                data-table-tooltip={tooltip.key}
                                key={index}>
                                <div className="table-settings-tooltip-item-title">{translate(tooltip.title)}</div>
                                <div
                                    className="table-settings-tooltip-item-description"
                                    dangerouslySetInnerHTML={{ __html: translate(tooltip.description) }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
