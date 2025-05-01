import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SponsorIdentity, {
    ProfileRecord,
    ProfileRecords,
    ProfileRecordTypes,
} from '../../../props/models/Sponsor/SponsorIdentity';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSponsorIdentitiesService from '../../../services/SponsorIdentitesService';
import Card from '../../elements/card/Card';
import CardBlockKeyValue from '../../elements/card/blocks/CardBlockKeyValue';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalEditProfileRecords from './modals/ModalEditProfileRecords';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import { hasPermission } from '../../../helpers/utils';
import IdentityReimbursementsCard from './cards/IdentityReimbursementsCard';
import IdentityFundRequestsCard from './cards/IdentityFundRequestsCard';
import IdentityBankAccountsCard from './cards/IdentityBankAccountsCard';
import IdentityVouchersCard from './cards/IdentityVouchersCard';
import IdentityPayoutsCard from './cards/IdentityPayoutsCard';
import IdentityRecordKeyValueWithHistory from './elements/IdentityRecordKeyValueWithHistory';
import { differenceInYears } from 'date-fns';
import { dateParse } from '../../../helpers/dates';

export default function IdentitiesShow() {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const recordTypeService = useRecordTypeService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const identityId = parseInt(useParams().id);
    const [identity, setIdentity] = useState<SponsorIdentity>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType & { key: ProfileRecordTypes }>>(null);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((map, recordType) => {
            return { ...map, [recordType.key]: recordType };
        }, {}) as ProfileRecords;
    }, [recordTypes]);

    const recordsByKey = useMemo(() => {
        return Object.keys(identity?.records || {})?.reduce((map, key) => {
            const record: ProfileRecord[] = identity?.records[key];

            return { ...map, [key]: record[0]?.value };
        }, {}) as { [key in ProfileRecordTypes]: string };
    }, [identity]);

    const otherEmails = useMemo(() => {
        return identity?.email_verified ? identity?.email_verified : [];
    }, [identity?.email_verified]);

    const identityCalculatedAge = useMemo(() => {
        return identity?.records?.birth_date?.[0]?.value
            ? Math.max(differenceInYears(new Date(), dateParse(identity?.records?.birth_date?.[0]?.value)), 0)
            : null;
    }, [identity?.records?.birth_date]);

    const fetchIdentity = useCallback(() => {
        setProgress(0);

        sponsorIdentitiesService
            .read(activeOrganization.id, identityId)
            .then((res) => setIdentity(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, identityId, setProgress, sponsorIdentitiesService]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list<RecordType & { key: ProfileRecordTypes }>()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const editProfileRecords = useCallback(
        (
            title: string,
            recordTypeKyes: ProfileRecordTypes[],
            disabledFields: Array<{ label: string; value: string; key: string }> = [],
            bodyOverflowVisible: boolean = false,
        ) => {
            openModal((modal) => (
                <ModalEditProfileRecords
                    modal={modal}
                    title={title}
                    disabledFields={disabledFields}
                    onDone={fetchIdentity}
                    identity={identity}
                    recordTypes={recordTypeKyes?.map((filter) => recordTypes?.find((item) => filter === item.key))}
                    values={recordsByKey}
                    organization={activeOrganization}
                    bodyOverflowVisible={bodyOverflowVisible}
                />
            ));
        },
        [openModal, fetchIdentity, identity, recordTypes, recordsByKey, activeOrganization],
    );

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    if (!identity || !recordTypes) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="identities"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    Personen
                </StateNavLink>

                <div className="breadcrumb-item active">#{identity?.id}</div>
            </div>

            <Card
                title={'Persoonsgegevens'}
                buttons={[
                    hasPermission(activeOrganization, 'manage_identities') && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () =>
                            editProfileRecords('Wijzig persoonsgegevens', [
                                'given_name',
                                'family_name',
                                'birth_date',
                                'gender',
                                'marital_status',
                                'client_number',
                            ]),
                    },
                ]}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        {
                            label: recordTypesByKey?.given_name?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.given_name} />,
                        },
                        {
                            label: recordTypesByKey?.family_name?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.family_name} />,
                        },
                        {
                            label: recordTypesByKey?.birth_date?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.birth_date} />,
                        },
                        {
                            label: 'Leeftijd',
                            value: identityCalculatedAge,
                        },
                        {
                            label: recordTypesByKey?.gender?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.gender} />,
                        },
                        {
                            label: recordTypesByKey?.marital_status?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.marital_status} />,
                        },
                        ...(activeOrganization.bsn_enabled ? [{ label: 'BSN', value: identity?.bsn }] : []),
                        {
                            label: recordTypesByKey?.client_number?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.client_number} />,
                        },
                    ]}
                />
            </Card>

            <Card
                title={'Huishouden'}
                buttons={[
                    hasPermission(activeOrganization, 'manage_identities') && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () =>
                            editProfileRecords(
                                'Wijzig huishouden',
                                ['house_composition', 'living_arrangement'],
                                [],
                                true,
                            ),
                    },
                ]}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        {
                            label: recordTypesByKey?.house_composition?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.house_composition} />,
                        },
                        {
                            label: recordTypesByKey?.living_arrangement?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.living_arrangement} />,
                        },
                    ]}
                />
            </Card>

            <Card title={'Accountgegevens'}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        { label: 'Accountnummer', value: identity?.id },
                        { label: 'Actief sinds', value: identity?.created_at_locale },
                        { label: 'Laatste inlog', value: identity?.last_login_at_locale },
                        { label: 'Laatste handeling', value: identity?.last_activity_at_locale },
                    ]}
                />
            </Card>

            <Card
                title={'Contactgegevens'}
                buttons={[
                    hasPermission(activeOrganization, 'manage_identities') && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => {
                            editProfileRecords(
                                'Wijzig contactgegevens',
                                ['telephone', 'mobile'],
                                [
                                    { label: 'Hoofd e-mailadres', value: identity.email, key: 'email' },
                                    ...otherEmails.map((email, index) => ({
                                        label: `Extra e-mailadres ${index + 1}`,
                                        value: email,
                                        key: `emails_verified_${index}`,
                                    })),
                                ],
                            );
                        },
                    },
                ]}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        { label: 'Hoofd e-mailadres', value: identity.email },
                        ...otherEmails.map((email, index) => ({
                            label: `Extra e-mailadres ${index + 1}`,
                            value: email,
                        })),
                        {
                            label: recordTypesByKey?.telephone?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.telephone} />,
                        },
                        {
                            label: recordTypesByKey?.mobile?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.mobile} />,
                        },
                    ]}
                />
            </Card>

            <Card
                title={'Adresgegevens'}
                buttons={[
                    hasPermission(activeOrganization, 'manage_identities') && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => {
                            editProfileRecords('Wijzig adresgegevens', [
                                'city',
                                'street',
                                'house_number',
                                'house_number_addition',
                                'postal_code',
                                'neighborhood_name',
                                'municipality_name',
                            ]);
                        },
                    },
                ]}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        {
                            label: recordTypesByKey?.city?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.city} />,
                        },
                        {
                            label: recordTypesByKey?.street?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.street} />,
                        },
                        {
                            label: recordTypesByKey?.house_number?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.house_number} />,
                        },
                        {
                            label: recordTypesByKey?.house_number_addition?.name,
                            value: (
                                <IdentityRecordKeyValueWithHistory records={identity.records.house_number_addition} />
                            ),
                        },
                        {
                            label: recordTypesByKey?.postal_code?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.postal_code} />,
                        },
                        {
                            label: recordTypesByKey?.neighborhood_name?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.neighborhood_name} />,
                        },
                        {
                            label: recordTypesByKey?.municipality_name?.name,
                            value: <IdentityRecordKeyValueWithHistory records={identity.records.municipality_name} />,
                        },
                    ]}
                />
            </Card>

            <IdentityBankAccountsCard
                identity={identity}
                organization={activeOrganization}
                fetchIdentity={fetchIdentity}
            />

            {hasPermission(activeOrganization, ['manage_vouchers', 'view_vouchers']) && (
                <IdentityVouchersCard organization={activeOrganization} identity={identity} />
            )}

            {activeOrganization?.allow_payouts && hasPermission(activeOrganization, 'manage_payouts') && (
                <IdentityPayoutsCard organization={activeOrganization} identity={identity} />
            )}

            {hasPermission(activeOrganization, 'manage_reimbursements') && (
                <IdentityReimbursementsCard organization={activeOrganization} identity={identity} />
            )}

            {hasPermission(activeOrganization, ['validate_records', 'manage_validators'], false) && (
                <IdentityFundRequestsCard organization={activeOrganization} identity={identity} />
            )}
        </Fragment>
    );
}
