import React, { useCallback } from 'react';
import Organization, { Permission } from '../../../../props/models/Organization';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import Card from '../../../elements/card/Card';
import CardTable from '../../../elements/card-table/CardTable';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalEditProfileBankAccount from '../modals/ModalEditProfileBankAccount';
import TableRowActions from '../../../elements/tables/TableRowActions';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../hooks/usePushApiError';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import { hasPermission } from '../../../../helpers/utils';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';

export default function IdentityBankAccountsCard({
    identity,
    organization,
    fetchIdentity,
}: {
    identity: SponsorIdentity;
    organization: Organization;
    fetchIdentity: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const canManageIdentities = hasPermission(organization, Permission.MANAGE_IDENTITIES);
    const canViewFundRequests = hasPermission(
        organization,
        [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
        false,
    );
    const canViewReimbursements = hasPermission(organization, Permission.MANAGE_REIMBURSEMENTS);
    const canViewPayouts = organization.allow_payouts && hasPermission(organization, Permission.MANAGE_PAYOUTS);

    const getBankAccountSourceMeta = useCallback(
        (bank_account: SponsorIdentity['bank_accounts'][number]) => {
            const label = bank_account.type_id
                ? `${bank_account.created_by_locale} #${bank_account.type_id}`
                : bank_account.created_by_locale;

            if (bank_account.type === 'fund_request' && bank_account.type_id && canViewFundRequests) {
                return {
                    label,
                    name: DashboardRoutes.FUND_REQUEST,
                    params: { organizationId: organization.id, id: bank_account.type_id },
                };
            }

            if (bank_account.type === 'reimbursement' && bank_account.type_id && canViewReimbursements) {
                return {
                    label,
                    name: DashboardRoutes.REIMBURSEMENT,
                    params: { organizationId: organization.id, id: bank_account.type_id },
                };
            }

            if (bank_account.type === 'payout' && canViewPayouts) {
                return {
                    label,
                    name: DashboardRoutes.PAYOUTS,
                    params: { organizationId: organization.id },
                };
            }

            return { label };
        },
        [canViewFundRequests, canViewPayouts, canViewReimbursements, organization.id],
    );

    const editBankAccount = useCallback(
        (id?: number) => {
            openModal((modal) => (
                <ModalEditProfileBankAccount
                    id={id}
                    modal={modal}
                    onDone={fetchIdentity}
                    identity={identity}
                    organization={organization}
                />
            ));
        },
        [fetchIdentity, identity, openModal, organization],
    );

    const deleteBankAccount = useCallback(
        (id?: number) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.confirm_extra_payment_refund.title')}
                    description={translate('modals.danger_zone.confirm_extra_payment_refund.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.confirm_extra_payment_refund.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            setProgress(0);

                            sponsorIdentitiesService
                                .deleteBankAccount(organization.id, identity.id, id)
                                .then(() => {
                                    fetchIdentity();
                                    return pushSuccess('Gelukt!');
                                })
                                .catch(pushApiError)
                                .finally(() => {
                                    setProgress(100);
                                    modal.close();
                                });
                        },
                        text: translate('modals.danger_zone.confirm_extra_payment_refund.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            fetchIdentity,
            identity.id,
            openModal,
            organization.id,
            pushApiError,
            pushSuccess,
            setProgress,
            sponsorIdentitiesService,
            translate,
        ],
    );

    return (
        <Card
            title={`Bankrekeningen (${identity.bank_accounts?.length || 0})`}
            buttons={[
                canManageIdentities && {
                    text: 'Aanmaken',
                    type: 'primary',
                    icon: 'plus-circle',
                    onClick: () => editBankAccount(null),
                },
            ]}>
            {identity?.bank_accounts.length === 0 ? (
                <EmptyCard title={'Geen bankrekening gevonden'} type={'card-section-content'} />
            ) : (
                <CardTable columns={sponsorIdentitiesService.getBankAccountColumns()}>
                    {identity?.bank_accounts?.map((bank_account, index) => {
                        const sourceMeta = getBankAccountSourceMeta(bank_account);
                        const canEdit = bank_account?.id && canManageIdentities;
                        const canViewSource = Boolean(sourceMeta.name);

                        return (
                            <tr key={index}>
                                <td>{bank_account.iban}</td>
                                <td>{bank_account.name}</td>
                                <td>
                                    <TableDateTime value={bank_account.updated_at_locale} />
                                </td>
                                <td>
                                    {sourceMeta.name ? (
                                        <StateNavLink
                                            name={sourceMeta.name}
                                            params={sourceMeta.params}
                                            className="text-primary text-semibold text-inherit text-decoration-link">
                                            {sourceMeta.label}
                                        </StateNavLink>
                                    ) : (
                                        sourceMeta.label
                                    )}
                                </td>
                                <td className="table-td-actions text-right">
                                    {canEdit || canViewSource ? (
                                        <TableRowActions
                                            content={(e) => (
                                                <div className="dropdown dropdown-actions">
                                                    {canViewSource && (
                                                        <TableRowActionItem
                                                            type="link"
                                                            name={sourceMeta.name}
                                                            params={sourceMeta.params}>
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                            Bekijk bron
                                                        </TableRowActionItem>
                                                    )}
                                                    {canEdit && (
                                                        <TableRowActionItem
                                                            type="button"
                                                            onClick={() => {
                                                                e.close();
                                                                editBankAccount(bank_account.id);
                                                            }}>
                                                            <em className="mdi mdi-pencil icon-start" />
                                                            Bewerking
                                                        </TableRowActionItem>
                                                    )}
                                                    {canEdit && (
                                                        <TableRowActionItem
                                                            type="button"
                                                            onClick={() => {
                                                                e.close();
                                                                deleteBankAccount(bank_account.id);
                                                            }}>
                                                            <em className="mdi mdi-close icon-start" />
                                                            Verwijderen
                                                        </TableRowActionItem>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    ) : (
                                        <TableEmptyValue />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </CardTable>
            )}
        </Card>
    );
}
