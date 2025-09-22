import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import Organization from '../../../../props/models/Organization';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import Modal from '../../../modals/elements/Modal';
import useProfileRecordTypes from '../../identitities-show/hooks/useProfileRecordTypes';
import SponsorIdentity, { ProfileRecordType } from '../../../../props/models/Sponsor/SponsorIdentity';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import useTableToggles from '../../../../hooks/useTableToggles';
import classNames from 'classnames';
import IdentitiesTableRowItems from '../../identities/elements/IdentitiesTableRowItems';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ProfileRecordsPersonal from '../../identitities-show/modals/elements/ProfileRecordsPersonal';
import Household from '../../../../props/models/Sponsor/Household';

export default function ModalSelectOrMakeSponsorIdentity({
    modal,
    onDone,
    className,
    organization,
    excludeRelation = null,
    excludeHousehold = null,
    multiselect = false,
}: {
    modal: ModalState;
    onDone?: (identities: SponsorIdentity[]) => void;
    className?: string;
    organization: Organization;
    excludeRelation?: SponsorIdentity;
    excludeHousehold?: Household;
    multiselect?: boolean;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [action, setAction] = useState<'find' | 'create'>('find');
    const [identities, setIdentities] = useState<PaginationData<SponsorIdentity>>(null);
    const { selected, setSelected, toggleAll, toggle } = useTableToggles(multiselect);
    const { recordTypesByKey } = useProfileRecordTypes();

    const form = useFormBuilder<Partial<{ [key in ProfileRecordType]: string }>>(
        {
            family_name: '',
            given_name: '',
            birth_date: '',
            gender: '',
            marital_status: '',
            client_number: '',
        },
        (values) => {
            if (action === 'create') {
                setProgress(0);

                sponsorIdentitiesService
                    .store(organization?.id, values)
                    .then((res) => {
                        setProgress(0);
                        onDone?.([res?.data?.data]);
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

            onDone(identities.data.filter((identity) => selected.includes(identity.id)));
        },
    );

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        per_page: number;
        exclude_household_id?: number;
    }>(
        {
            q: '',
            per_page: 5,
            exclude_id: excludeRelation?.id ?? null,
            exclude_relation_id: excludeRelation?.id ?? null,
            exclude_household_id: excludeHousehold?.id ?? null,
        },
        { throttledValues: ['q'] },
    );

    const fetchIdentities = useCallback(() => {
        setSelected([]);
        setProgress(0);

        sponsorIdentitiesService
            .list(organization.id, { ...filterActiveValues })
            .then((res) => setIdentities(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setSelected, setProgress, sponsorIdentitiesService, organization.id, filterActiveValues, pushApiError]);

    const { headElement } = useConfigurableTable(sponsorIdentitiesService.getColumns(organization), {
        filter: filter,
        sortable: false,
        hasTooltips: false,
        trPrepend: multiselect && (
            <th className="th-narrow">
                <TableCheckboxControl
                    checked={selected.length == identities?.data?.length}
                    onClick={(e) => toggleAll(e, identities?.data)}
                />
            </th>
        ),
    });

    useEffect(() => {
        if (action === 'find') {
            fetchIdentities();
        }
    }, [action, fetchIdentities]);

    return (
        <Modal
            title="Search persons"
            className={className}
            dusk="modalHouseholds"
            size={'lg'}
            onSubmit={form.submit}
            modal={modal}
            footer={
                <div className={'button-group flex-space-between'}>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Sluiten
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={(action === 'find' && selected?.length == 0) || form.isLocked}>
                        Bevestigen
                    </button>
                </div>
            }
            body={
                <div className={'modal-body'}>
                    <div className="modal-section">
                        <div className="flex flex-gap flex-vertical">
                            <FormPane title={'Find or Create person'}>
                                <div className="block block-export-options">
                                    <div className="export-section">
                                        <div className="export-options">
                                            {[
                                                { label: 'Find a person', value: 'find' },
                                                { label: 'Add new person', value: 'create' },
                                            ].map((field, index) => (
                                                <label
                                                    key={index}
                                                    className="export-option"
                                                    htmlFor={`radio_action_${index}`}>
                                                    <input
                                                        type="radio"
                                                        id={`radio_action_${index}`}
                                                        checked={field.value === action}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            setAction(e.target.value as 'find' | 'create');
                                                        }}
                                                    />
                                                    <div className="export-option-label">
                                                        {field.value === 'find' && (
                                                            <em className="export-option-icon mdi mdi-magnify" />
                                                        )}
                                                        {field.value === 'create' && (
                                                            <em className="export-option-icon mdi mdi-plus-circle" />
                                                        )}
                                                        <span>{field.label}</span>
                                                        <div className="export-option-circle" />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </FormPane>

                            {action === 'find' ? (
                                <FormPane title={'Search person'}>
                                    <FormGroup
                                        label={'Search'}
                                        info={'Search for a person in the system.'}
                                        input={(id) => (
                                            <input
                                                id={id}
                                                type="text"
                                                className={'form-control'}
                                                placeholder={'Search'}
                                                value={filterValues.q}
                                                autoComplete={'off'}
                                                onChange={(e) => filterUpdate({ q: e.target.value })}
                                            />
                                        )}
                                    />
                                </FormPane>
                            ) : (
                                <ProfileRecordsPersonal
                                    form={form}
                                    recordTypes={{
                                        given_name: recordTypesByKey.given_name,
                                        family_name: recordTypesByKey.family_name,
                                        birth_date: recordTypesByKey.birth_date,
                                        gender: recordTypesByKey.gender,
                                        marital_status: recordTypesByKey.marital_status,
                                        client_number: recordTypesByKey.client_number,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {action === 'find' && identities && (
                        <Fragment>
                            <div className="modal-header modal-header-compact">
                                <div className="modal-header-title">Matches ({identities?.meta?.total})</div>
                            </div>
                            <div className="modal-section modal-section-collapse modal-section-light">
                                <div className="table-wrapper">
                                    <TableTopScroller>
                                        <table className="table">
                                            {headElement}

                                            <tbody>
                                                {identities?.data.map((identity) => (
                                                    <tr
                                                        key={identity.id}
                                                        className={classNames(
                                                            'tr-collapsed',
                                                            selected.includes(identity.id) && 'selected',
                                                        )}>
                                                        <td className="td-narrow">
                                                            <TableCheckboxControl
                                                                checked={selected.includes(identity.id)}
                                                                onClick={(e) => toggle(e, identity)}
                                                            />
                                                        </td>
                                                        <IdentitiesTableRowItems
                                                            actions={false}
                                                            identity={identity}
                                                            organization={organization}
                                                        />
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </TableTopScroller>
                                </div>
                            </div>
                            <div className="modal-section modal-section-compact">
                                <Paginator meta={identities.meta} filters={filterValues} updateFilters={filterUpdate} />
                            </div>
                        </Fragment>
                    )}
                </div>
            }
        />
    );
}
