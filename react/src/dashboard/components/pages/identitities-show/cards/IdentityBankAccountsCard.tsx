import React, { useCallback } from 'react';
import Organization from '../../../../props/models/Organization';
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
                hasPermission(organization, 'manage_identities') && {
                    text: 'Aanmaken',
                    type: 'primary',
                    icon: 'plus-circle',
                    onClick: () => editBankAccount(null),
                },
            ]}>
            {identity?.bank_accounts.length === 0 ? (
                <EmptyCard title={'Geen tegoeden gevonden'} type={'card-section-content'} />
            ) : (
                <CardTable columns={sponsorIdentitiesService.getBankAccountColumns()}>
                    {identity?.bank_accounts?.map((bank_account, index) => (
                        <tr key={index}>
                            <td>{bank_account.iban}</td>
                            <td>{bank_account.name}</td>
                            <td>
                                <TableDateTime value={bank_account.updated_at_locale} />
                            </td>
                            <td>{bank_account.created_by_locale}</td>

                            <td className="table-td-actions text-right">
                                {bank_account?.id && hasPermission(organization, 'manage_identities') ? (
                                    <TableRowActions
                                        content={(e) => (
                                            <div className="dropdown dropdown-actions">
                                                <div
                                                    onClick={() => {
                                                        e.close();
                                                        editBankAccount(bank_account.id);
                                                    }}
                                                    className="dropdown-item">
                                                    Bewerking
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        e.close();
                                                        deleteBankAccount(bank_account.id);
                                                    }}
                                                    className="dropdown-item">
                                                    Verwijderen
                                                </div>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                        </tr>
                    ))}
                </CardTable>
            )}
        </Card>
    );
}
