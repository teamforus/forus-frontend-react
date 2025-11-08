import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SponsorIdentity from '../../../props/models/Sponsor/SponsorIdentity';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSponsorIdentitiesService from '../../../services/SponsorIdentitesService';
import Card from '../../elements/card/Card';
import CardBlockKeyValue from '../../elements/card/blocks/CardBlockKeyValue';
import { hasPermission } from '../../../helpers/utils';
import IdentityReimbursementsCard from './cards/IdentityReimbursementsCard';
import IdentityFundRequestsCard from './cards/IdentityFundRequestsCard';
import IdentityBankAccountsCard from './cards/IdentityBankAccountsCard';
import IdentityVouchersCard from './cards/IdentityVouchersCard';
import IdentityPayoutsCard from './cards/IdentityPayoutsCard';
import IdentityRecordKeyValueWithHistory from './elements/IdentityRecordKeyValueWithHistory';
import { differenceInYears } from 'date-fns';
import { dateParse } from '../../../helpers/dates';
import BlockCardEmails from '../../elements/block-card-emails/BlockCardEmails';
import useEmailLogService from '../../../services/EmailLogService';
import useEditProfileRecords from './hooks/useEditProfileRecords';
import { Permission } from '../../../props/models/Organization';
import useProfileRecordTypes from './hooks/useProfileRecordTypes';
import IdentityPerson from '../fund-requests-view/elements/IdentityPerson';
import ProfileRelationsCard from './elements/ProfileRelationsCard';
import BlockCardNotes from '../../elements/block-card-notes/BlockCardNotes';
import Note from '../../../props/models/Note';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function IdentitiesShow() {
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const emailLogService = useEmailLogService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();
    const { recordTypes, recordTypesByKey } = useProfileRecordTypes();

    const identityId = parseInt(useParams().id);
    const [identity, setIdentity] = useState<SponsorIdentity>(null);

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

    const editProfileRecords = useEditProfileRecords(activeOrganization, recordTypes);

    const fetchEmailLogs = useCallback(
        (query = {}) =>
            emailLogService.list(activeOrganization.id, {
                identity_id: identity.id,
                ...query,
            }),
        [activeOrganization?.id, identity?.id, emailLogService],
    );

    const fetchNotes = useCallback(
        (query = {}) => {
            return sponsorIdentitiesService.notes(activeOrganization.id, identity?.id, query);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    const deleteNote = useCallback(
        (note: Note) => {
            return sponsorIdentitiesService.noteDestroy(activeOrganization.id, identity?.id, note.id);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    const storeNote = useCallback(
        (data: { description: string }) => {
            return sponsorIdentitiesService.storeNote(activeOrganization.id, identity?.id, data);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    if (!identity || identity?.id !== identityId || !recordTypes) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name={DashboardRoutes.IDENTITIES}
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    Personen
                </StateNavLink>

                <div className="breadcrumb-item active">#{identity?.id}</div>
            </div>

            <Card
                title={'Persoonsgegevens'}
                buttons={[
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => {
                            editProfileRecords(identity, 'Wijzig persoonsgegevens', 'personal', fetchIdentity);
                        },
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

            {activeOrganization.has_person_bsn_api && identity?.bsn && (
                <IdentityPerson organization={activeOrganization} identityId={identity.id} />
            )}

            <BlockCardNotes showCreate={true} fetchNotes={fetchNotes} deleteNote={deleteNote} storeNote={storeNote} />

            <Card
                title={'Huishouden'}
                buttons={[
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => editProfileRecords(identity, 'Wijzig huishouden', 'house', fetchIdentity),
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

            {activeOrganization?.allow_profiles_relations && (
                <ProfileRelationsCard organization={activeOrganization} identity={identity} />
            )}

            <Card title={'Accountgegevens'}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        { label: 'Accountnummer', value: identity?.id },
                        identity?.type_locale ? { label: 'Account type', value: identity?.type_locale } : null,
                        identity?.employee_email ? { label: 'Aangemaakt door', value: identity?.employee_email } : null,
                        { label: 'Aangemaakt op', value: identity?.created_at_locale },
                        { label: 'Laatste inlog', value: identity?.last_login_at_locale },
                        { label: 'Laatste handeling', value: identity?.last_activity_at_locale },
                    ].filter((item) => item !== null)}
                />
            </Card>

            <Card
                title={'Contactgegevens'}
                buttons={[
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => {
                            editProfileRecords(identity, 'Wijzig contactgegevens', 'contacts', fetchIdentity, [
                                { label: 'Hoofd e-mailadres', value: identity.email, key: 'email' },
                                ...otherEmails.map((email, index) => ({
                                    label: `Extra e-mailadres ${index + 1}`,
                                    value: email,
                                    key: `emails_verified_${index}`,
                                })),
                            ]);
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
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => {
                            editProfileRecords(identity, 'Wijzig adresgegevens', 'address', fetchIdentity);
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

            {hasPermission(activeOrganization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]) && (
                <IdentityVouchersCard organization={activeOrganization} identity={identity} />
            )}

            {activeOrganization?.allow_payouts && hasPermission(activeOrganization, Permission.MANAGE_PAYOUTS) && (
                <IdentityPayoutsCard organization={activeOrganization} identity={identity} />
            )}

            {hasPermission(activeOrganization, Permission.MANAGE_REIMBURSEMENTS) && (
                <IdentityReimbursementsCard organization={activeOrganization} identity={identity} />
            )}

            {hasPermission(activeOrganization, [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS], false) && (
                <IdentityFundRequestsCard organization={activeOrganization} identity={identity} />
            )}

            <BlockCardEmails organization={activeOrganization} fetchLogEmails={fetchEmailLogs} />
        </Fragment>
    );
}
