import React, { useCallback, useMemo, useState } from 'react';
import FormError from '../../../elements/forms/errors/FormError';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import PreCheck from '../../../../props/models/PreCheck';
import PreCheckRecord from '../../../../props/models/PreCheckRecord';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function PreCheckStepEditorItemRecordSettings({
    preChecks,
    preCheckIndex,
    recordIndex,
    onUpdate,
    collapse,
    unCollapse,
    unCollapsed,
    errors = null,
}: {
    preChecks: Array<PreCheck>;
    preCheckIndex: number;
    recordIndex: number;
    onUpdate: (values: object) => void;
    collapse: (uid: string) => void;
    unCollapse: (uid: string) => void;
    unCollapsed: Array<string>;
    errors: ResponseErrorData;
}) {
    const assetUrl = useAssetUrl();

    const [record, setRecord] = useState<PreCheckRecord>(preChecks[preCheckIndex].record_types[recordIndex]);

    const errorPrefix = useMemo(
        () => `pre_checks.${preCheckIndex}.record_types.${recordIndex}.record_settings.`,
        [preCheckIndex, recordIndex],
    );

    const updateSettings = useCallback(
        (settingsKey: number, values: object) => {
            record.record_settings[settingsKey] = { ...record.record_settings[settingsKey], ...values };
            setRecord({ ...record, record_settings: record.record_settings });
            onUpdate(record);
        },
        [onUpdate, record],
    );

    const toggleCollapse = useCallback(() => {
        if (unCollapsed.includes(`${record.record_type_key}_settings`)) {
            collapse(`${record.record_type_key}_settings`);
        } else {
            unCollapse(`${record.record_type_key}_settings`);
        }
    }, [collapse, record?.record_type_key, unCollapse, unCollapsed]);

    return (
        <div className="pre-check-item-settings">
            <div className="pre-check-item-settings-header" onClick={() => toggleCollapse()}>
                {unCollapsed.includes(`${record.record_type_key}_settings`) ? (
                    <em className="mdi mdi-menu-down" />
                ) : (
                    <em className="mdi mdi-menu-right" />
                )}

                <div className="pre-check-knock-out-settings-title">Impact instellingen</div>
            </div>

            {unCollapsed.includes(`${record.record_type_key}_settings`) && (
                <div className="pre-check-item-settings-list">
                    <div className="pre-check-item-settings-labels">
                        <div className="pre-check-item-settings-label form-label">Naam fonds</div>
                        <div className="pre-check-item-settings-label form-label">Impact niveau (%)</div>
                        <div className="pre-check-item-settings-label form-label" />
                    </div>

                    {record.record_settings.map((record_setting, settingsKey) => (
                        <div className="pre-check-item-settings-item" key={settingsKey}>
                            <div className="pre-check-item-settings-item-content">
                                <div className="pre-check-item-settings-item-fund">
                                    <div className="pre-check-item-settings-item-fund-media">
                                        <img
                                            src={
                                                record_setting.fund_logo?.sizes.thumbnail ||
                                                assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                            }
                                            alt={''}
                                        />
                                    </div>

                                    <div className="pre-check-item-settings-item-fund-content">
                                        <div className="pre-check-item-settings-item-fund-title">
                                            {record_setting.fund_name}
                                        </div>
                                        <a
                                            className="pre-check-item-settings-item-fund-subtitle"
                                            target="_blank"
                                            href={record_setting.implementation_url_webshop}
                                            rel="noreferrer">
                                            {record_setting.implementation_name}
                                        </a>
                                    </div>
                                </div>

                                <div className="pre-check-item-settings-item-weight">
                                    <input
                                        className="form-control"
                                        type="number"
                                        disabled={record_setting.is_knock_out}
                                        defaultValue={record_setting.impact_level}
                                        placeholder="Impact niveau (%)"
                                        step={1}
                                        min={0}
                                        max={100}
                                        onChange={(e) => {
                                            updateSettings(settingsKey, {
                                                impact_level: e.target.value,
                                            });
                                        }}
                                    />

                                    <FormError error={errors?.[`${errorPrefix}.${settingsKey}.impact_level`]} />
                                </div>

                                <div className="pre-check-item-settings-item-knockout">
                                    <CheckboxControl
                                        title={'Knock-out'}
                                        checked={record_setting.is_knock_out}
                                        className={'checkbox-narrow'}
                                        onChange={(e) => {
                                            updateSettings(settingsKey, {
                                                is_knock_out: e.target.checked,
                                            });
                                        }}
                                    />
                                    <FormError error={errors?.[`${errorPrefix}.${settingsKey}.is_knock_out`]} />
                                </div>
                            </div>

                            {record_setting.is_knock_out && (
                                <div className="pre-check-item-settings-item-note">
                                    <label className="form-label">Beschrijving van de knock-out voorwaarde</label>
                                    <input
                                        className="form-control"
                                        name={`record_settings_${preCheckIndex}_${record_setting.fund_id}_description`}
                                        defaultValue={record_setting.description}
                                        placeholder="Voeg een beschrijving toe"
                                        onChange={(e) => {
                                            updateSettings(settingsKey, {
                                                description: e.target.value,
                                            });
                                        }}
                                    />

                                    <div className="form-hint">
                                        De informatieve beschrijving kan maximaal 1000 tekens bevatten.
                                    </div>

                                    <FormError error={errors?.[`${errorPrefix}.${settingsKey}.description`]} />
                                </div>
                            )}

                            <div className="pre-check-item-settings-item-separator" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
