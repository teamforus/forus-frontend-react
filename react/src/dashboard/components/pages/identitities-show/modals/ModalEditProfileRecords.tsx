import React, { Fragment, useMemo } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import usePushApiError from '../../../../hooks/usePushApiError';
import { ResponseError } from '../../../../props/ApiResponses';
import SponsorIdentity, { ProfileRecord, ProfileRecordType } from '../../../../props/models/Sponsor/SponsorIdentity';
import Modal from '../../../modals/elements/Modal';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import RecordType from '../../../../props/models/RecordType';
import useTranslate from '../../../../hooks/useTranslate';
import FormPane from '../../../elements/forms/elements/FormPane';
import ProfileRecordsPersonal from './elements/ProfileRecordsPersonal';
import ProfileRecordsHouse from './elements/ProfileRecordsHouse';
import ProfileRecordsContacts from './elements/ProfileRecordsContacts';
import ProfileRecordsAddress from './elements/ProfileRecordsAddress';

export type GroupType = 'personal' | 'house' | 'contacts' | 'address';

export default function ModalEditProfileRecords({
    modal,
    title,
    onDone,
    group,
    identity,
    recordTypes,
    organization,
    disabledFields,
    bodyOverflowVisible = false,
}: {
    modal: ModalState;
    title: string;
    onDone: () => void;
    group: GroupType;
    identity?: SponsorIdentity;
    recordTypes: Array<RecordType & { key: ProfileRecordType }>;
    organization: Organization;
    disabledFields?: Array<{ label: string; value: string; key: string }>;
    bodyOverflowVisible?: boolean;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const pushApiError = usePushApiError();

    const recordsByKey = useMemo(() => {
        return Object.keys(identity?.records || {})?.reduce((map, key) => {
            const record: ProfileRecord[] = identity?.records[key];

            return { ...map, [key]: record[0]?.value };
        }, {}) as { [key in ProfileRecordType]: string };
    }, [identity]);

    const recordKeysByGroup = useMemo((): ProfileRecordType[] => {
        if (group === 'personal') {
            return ['given_name', 'family_name', 'birth_date', 'gender', 'marital_status', 'client_number'];
        }

        if (group === 'house') {
            return ['house_composition', 'living_arrangement'];
        }

        if (group == 'contacts') {
            return ['telephone', 'mobile'];
        }

        if (group == 'address') {
            return [
                'city',
                'street',
                'house_number',
                'house_number_addition',
                'postal_code',
                'neighborhood_name',
                'municipality_name',
            ];
        }

        return [];
    }, [group]);

    const recordsByGroup = useMemo(() => {
        return recordKeysByGroup?.map((filter) => {
            return recordTypes?.find((item) => filter === item.key);
        });
    }, [recordKeysByGroup, recordTypes]);

    const recordsByGroupByKey = useMemo(() => {
        return recordsByGroup.reduce((map, record) => {
            return { ...map, [record.key]: record };
        }, {});
    }, [recordsByGroup]);

    const form = useFormBuilder<{ [key in ProfileRecordType]: string }>(
        Object.keys(recordsByKey).reduce((list, key: ProfileRecordType) => {
            if (recordKeysByGroup.includes(key)) {
                return { ...list, [key]: recordsByKey[key] };
            }

            return list;
        }, {}) as {
            [key in ProfileRecordType]: string;
        },
        (values) => {
            if (!identity) {
                sponsorIdentitiesService
                    .store(organization?.id, values)
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
                return;
            }

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
            <div className="flex flex-vertical flex-gap">
                {group === 'personal' && <ProfileRecordsPersonal form={form} recordTypes={recordsByGroupByKey} />}
                {group === 'house' && <ProfileRecordsHouse form={form} recordTypes={recordsByGroupByKey} />}
                {group === 'contacts' && <ProfileRecordsContacts form={form} recordTypes={recordsByGroupByKey} />}
                {group === 'address' && <ProfileRecordsAddress form={form} recordTypes={recordsByGroupByKey} />}

                {disabledFields?.length > 0 && (
                    <FormPane title={'Non editable'}>
                        {disabledFields?.map((field, index) => {
                            return (
                                <FormGroup
                                    key={index}
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
                    </FormPane>
                )}
            </div>
        </Modal>
    );
}
