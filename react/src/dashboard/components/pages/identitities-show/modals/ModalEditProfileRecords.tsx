import React, { Fragment } from 'react';
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

export default function ModalEditProfileRecords({
    modal,
    onDone,
    values,
    identity,
    recordTypes,
    organization,
    disabledFields,
    bodyOverflowVisible = false,
}: {
    modal: ModalState;
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

    const pushApiError = usePushApiError();

    const form = useFormBuilder<{ [key in ProfileRecordTypes]: string }>(
        Object.keys(values).reduce((list, key) => ({ ...list, [key]: values[key] }), {}) as {
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

    const { submit: formSubmit } = form;

    return (
        <Modal
            modal={modal}
            title={'Edit info'}
            onSubmit={formSubmit}
            bodyOverflowVisible={bodyOverflowVisible}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Cancel
                    </button>
                    <button type="submit" className="button button-primary">
                        Submit
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
                    <FormGroup
                        key={recordType.key}
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
                                    <input
                                        id={id}
                                        type={'text'}
                                        className="form-control"
                                        value={form.values[recordType.key] || ''}
                                        placeholder={recordType.name}
                                        onChange={(e) => form.update({ [recordType.key]: e.target.value })}
                                    />
                                )}
                            </FormGroupInfo>
                        )}
                    />
                );
            })}
        </Modal>
    );
}
