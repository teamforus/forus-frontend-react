import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import React, { useCallback, useMemo, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import ModalPreCheckEditFundExclusions from '../../../modals/ModalPreCheckEditFundExclusions';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useTranslate from '../../../../hooks/useTranslate';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushApiError from '../../../../hooks/usePushApiError';
import Implementation from '../../../../props/models/Implementation';
import usePreCheckService from '../../../../services/PreCheckService';
import { strLimit } from '../../../../helpers/string';
import PreCheckFundsLogo from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/pre-check-funds-logo.svg';

export default function PreCheckExclusionsCard({
    funds,
    onChange,
    implementation,
    activeOrganization,
}: {
    funds: Array<Fund>;
    onChange: () => void;
    implementation: Implementation;
    activeOrganization: Organization;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const [showExcludedFunds, setShowExcludedFunds] = useState(true);

    const preCheckService = usePreCheckService();

    const excludedFunds = useMemo(() => {
        return funds?.filter((fund) => fund.pre_check_excluded || fund.pre_check_note) || [];
    }, [funds]);

    const editFundPreCheckSettings = useCallback(
        (fund: Fund) => {
            openModal((modal) => (
                <ModalPreCheckEditFundExclusions
                    modal={modal}
                    fund={fund}
                    funds={funds}
                    implementation={implementation}
                    activeOrganization={activeOrganization}
                    onDone={onChange}
                />
            ));
        },
        [activeOrganization, implementation, onChange, funds, openModal],
    );

    const askConfirmation = useCallback(
        (onConfirm: () => void): void => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.exclude_pre_check_fund.title')}
                    description_text={translate('modals.danger_zone.exclude_pre_check_fund.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.exclude_pre_check_fund.buttons.cancel'),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.exclude_pre_check_fund.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const removeFundPreCheckExclusion = useCallback(
        (fund_id: number) => {
            askConfirmation(() => {
                preCheckService
                    .sync(activeOrganization.id, implementation.id, { exclusions_remove: [fund_id] })
                    .then(() => onChange())
                    .catch(pushApiError);
            });
        },
        [activeOrganization.id, implementation.id, askConfirmation, onChange, preCheckService, pushApiError],
    );

    const addFundExclusion = useCallback(() => {
        const excludedFundIds = excludedFunds.map((fund) => fund.id);

        openModal((modal) => (
            <ModalPreCheckEditFundExclusions
                modal={modal}
                funds={funds.filter((fund) => !excludedFundIds.includes(fund.id))}
                implementation={implementation}
                activeOrganization={activeOrganization}
                onDone={() => onChange()}
            />
        ));
    }, [activeOrganization, implementation, excludedFunds, onChange, funds, openModal]);

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow" onClick={() => setShowExcludedFunds(!showExcludedFunds)}>
                    Afwijkend en uitsluitend ({excludedFunds?.length})
                </div>

                <button
                    className="button button-primary button-sm"
                    onClick={addFundExclusion}
                    disabled={funds.length <= excludedFunds.length}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    Fonds toevoegen
                </button>
            </div>

            {excludedFunds?.length > 0 ? (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Fonds</th>
                                        <th>Uitgesloten</th>
                                        <th>Uitleg</th>
                                        <th className="th-narrow text-right">
                                            {translate('components.organization_funds.labels.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excludedFunds.map((fund) => (
                                        <tr key={fund.id}>
                                            <td>{fund.name}</td>
                                            <td>{fund.pre_check_excluded ? 'Ja' : 'Nee'}</td>
                                            <td>
                                                {!fund.pre_check_excluded && fund.pre_check_note ? (
                                                    strLimit(fund.pre_check_note, 500)
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td className="table-td-actions">
                                                <TableRowActions
                                                    content={(e) => (
                                                        <div className="dropdown dropdown-actions">
                                                            <a
                                                                className={`dropdown-item`}
                                                                onClick={() => {
                                                                    e.close();
                                                                    editFundPreCheckSettings(fund);
                                                                }}>
                                                                <em className="mdi mdi-pencil icon-start" />
                                                                Bewerken
                                                            </a>
                                                            <a
                                                                className={`dropdown-item`}
                                                                onClick={() => {
                                                                    e.close();
                                                                    removeFundPreCheckExclusion(fund.id);
                                                                }}>
                                                                <em className="mdi mdi-close-circle-outline icon-start" />
                                                                Verwijderen
                                                            </a>
                                                        </div>
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyCard title={'Geen fondsen'} imageIconSvg={<PreCheckFundsLogo />} type={'card-section'} />
            )}
        </div>
    );
}
