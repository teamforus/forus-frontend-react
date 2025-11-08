import React, { Fragment, useCallback, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import classNames from 'classnames';
import PhotoSelectorData from '../types/PhotoSelectorData';

export default function PhotoSelectorBannerControl({
    label,
    value,
    valueType = 'string',
    activeKey,
    setActiveKey,
    controlKey,
    onCancel,
    onApply,
    children,
    templateData,
    setTemplateData,
    disabled = false,
}: {
    label: string;
    value: string;
    valueType?: 'string' | 'color';
    controlKey: 'style' | 'button' | 'color' | 'background' | 'overlay';
    activeKey: 'style' | 'button' | 'color' | 'background' | 'overlay';
    setActiveKey: React.Dispatch<React.SetStateAction<'style' | 'button' | 'color' | 'background' | 'overlay'>>;
    onCancel?: () => void;
    onApply?: () => void;
    children?: React.ReactNode | React.ReactNode[];
    templateData?: PhotoSelectorData;
    setTemplateData?: React.Dispatch<React.SetStateAction<PhotoSelectorData>>;
    disabled?: boolean;
}) {
    const [templateDataBackup, setTemplateDataBackup] = useState<PhotoSelectorData>(null);

    const cancel = useCallback(() => {
        if (templateDataBackup) {
            setTemplateData({ ...templateDataBackup });
        }

        onCancel?.();
        setActiveKey?.(null);
    }, [onCancel, setActiveKey, setTemplateData, templateDataBackup]);

    return (
        <div className="banner-editor-control">
            <div className="banner-editor-control-label">{label}</div>
            <div
                className={classNames(
                    valueType === 'string' && 'banner-editor-control-value',
                    valueType === 'color' && 'banner-editor-control-color',
                    disabled && 'disabled',
                )}
                onClick={() => {
                    if (disabled) {
                        return;
                    }

                    const newKey = activeKey === controlKey ? null : controlKey;

                    setActiveKey(newKey);

                    if (newKey && newKey !== activeKey) {
                        setTemplateDataBackup({ ...templateData });
                    }

                    if (!newKey) {
                        setTemplateDataBackup(null);
                    }
                }}>
                {valueType === 'string' ? (
                    <Fragment>{value}</Fragment>
                ) : (
                    <div className={'banner-editor-control-color-preview'} style={{ backgroundColor: value }} />
                )}
                <em className="mdi mdi-chevron-down" />
                {activeKey === controlKey && (
                    <ClickOutside
                        attr={{ onClick: (e) => e.stopPropagation() }}
                        onClickOutside={cancel}
                        className="banner-editor-dropdown">
                        <div className="banner-editor-dropdown-triangle" />
                        <div className="banner-editor-dropdown-body">
                            <div className="banner-editor-dropdown-close mdi mdi-close" onClick={cancel} />
                            <div className={'form'}>{children}</div>
                            <div className="banner-editor-dropdown-separator" />
                            <div className="banner-editor-dropdown-actions">
                                <div className="button button-default button-sm" onClick={cancel}>
                                    <em className="mdi mdi-backup-restore icon-start" />
                                    Annuleren
                                </div>
                                <div
                                    className="button button-primary button-sm"
                                    onClick={() => {
                                        onApply?.();
                                        setActiveKey?.(null);
                                    }}>
                                    <em className="mdi mdi-check icon-start" />
                                    Bevestigen
                                </div>
                            </div>
                        </div>
                    </ClickOutside>
                )}
            </div>
        </div>
    );
}
