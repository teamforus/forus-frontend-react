import React, { Fragment, useCallback } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import usePushApiError from '../../../../hooks/usePushApiError';
import { ResponseError } from '../../../../props/ApiResponses';
import SponsorIdentity, { ProfileRecordTypes } from '../../../../props/models/Sponsor/SponsorIdentity';
import Modal from '../../../modals/elements/Modal';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import FormGroup from '../../../elements/forms/controls/FormGroup';
import RecordType from '../../../../props/models/RecordType';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import useTranslate from '../../../../hooks/useTranslate';
import SelectControl from '../../../elements/select-control/SelectControl';
import { differenceInYears } from 'date-fns';

export default function ModalEditProfileRecords({
    modal,
    title,
    onDone,
    values,
    identity,
    recordTypes,
    organization,
    disabledFields,
    bodyOverflowVisible = false,
}: {
    modal: ModalState;
    title: string;
    onDone: () => void;
    values: { [key in ProfileRecordTypes]: string };
    identity: SponsorIdentity;
    recordTypes: Array<RecordType & { key: ProfileRecordTypes }>;
    organization: Organization;
    disabledFields?: Array<{ label: string; value: string; key: string }>;
    bodyOverflowVisible?: boolean;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const sponsorIdentitiesService = useSponsorIdentitiesService();
    const types = recordTypes.map((type) => type.key.toString());

    const pushApiError = usePushApiError();

    const form = useFormBuilder<{ [key in ProfileRecordTypes]: string }>(
        Object.keys(values).reduce((list, key) => {
            if (types.includes(key)) {
                return { ...list, [key]: values[key] };
            }

            return list;
        }, {}) as {
            [key in ProfileRecordTypes]: string;
        },
        (values) => {
            sponsorIdentitiesService
                .update(organization.id, identity.id, values)
                .then(() => {
                    onDone?.();
                    modal.close();
                })
                .catch((res: ResponseError) => {
                    form.setErrors(res.data.errors);
                    pushApiError(res);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const calculatedAge = useCallback((value: string) => {
        return value ? Math.max(differenceInYears(new Date(), dateParse(value)), 0) : null;
    }, []);

    const { submit: formSubmit } = form;

    return (
        <Modal
            modal={modal}
            title={title}
            onSubmit={formSubmit}
            bodyOverflowVisible={bodyOverflowVisible}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </Fragment>
            }>
            {disabledFields?.map((field, index) => {
                return (
                    <FormGroup
                        key={index}
                        inline={true}
                        inlineSize={'lg'}
                        label={field.label}
                        input={(id) => (
                            <FormGroupInfo info={translate('identities.record_info.' + field.key)}>
                                <input
                                    id={id}
                                    type={'text'}
                                    className="form-control"
                                    disabled={true}
                                    value={field.value || '---'}
                                />
                            </FormGroupInfo>
                        )}
                    />
                );
            })}
            {recordTypes?.map((recordType) => {
                return (
                    <Fragment key={recordType.key}>
                        <FormGroup
                            inline={true}
                            inlineSize={'lg'}
                            label={recordType.name}
                            error={form.errors?.[recordType.key]}
                            input={(id) => (
                                <FormGroupInfo info={translate('identities.record_info.' + recordType.key)}>
                                    {recordType.key === 'birth_date' ? (
                                        <DatePickerControl
                                            value={dateParse(form.values[recordType.key] || '')}
                                            placeholder={recordType.name}
                                            onChange={(date) => form.update({ [recordType.key]: dateFormat(date) })}
                                        />
                                    ) : (
                                        <Fragment>
                                            {recordType?.type === 'select' ? (
                                                <SelectControl
                                                    id={id}
                                                    value={form.values[recordType.key] || ''}
                                                    propKey={'value'}
                                                    propValue={'name'}
                                                    options={[
                                                        { value: '', name: 'Selecteer...' },
                                                        ...recordType.options,
                                                    ]}
                                                    multiline={true}
                                                    placeholder={recordType.name}
                                                    onChange={(value: string) =>
                                                        form.update({ [recordType.key]: value })
                                                    }
                                                />
                                            ) : (
                                                <input
                                                    id={id}
                                                    type={'text'}
                                                    className="form-control"
                                                    value={form.values[recordType.key] || ''}
                                                    placeholder={recordType.name}
                                                    onChange={(e) => form.update({ [recordType.key]: e.target.value })}
                                                />
                                            )}
                                        </Fragment>
                                    )}
                                </FormGroupInfo>
                            )}
                        />

                        {recordType?.key === 'birth_date' && (
                            <FormGroup
                                inline={true}
                                inlineSize={'lg'}
                                label={'Leeftijd'}
                                input={(id) => (
                                    <FormGroupInfo info={translate('identities.record_info.age')}>
                                        <input
                                            id={id}
                                            disabled={true}
                                            type={'text'}
                                            className="form-control"
                                            value={calculatedAge(form.values.birth_date)?.toString() || ''}
                                            placeholder={recordType.name}
                                            onChange={(e) => form.update({ [recordType.key]: e.target.value })}
                                        />
                                    </FormGroupInfo>
                                )}
                            />
                        )}
                    </Fragment>
                );
            })}
        </Modal>
    );
}
