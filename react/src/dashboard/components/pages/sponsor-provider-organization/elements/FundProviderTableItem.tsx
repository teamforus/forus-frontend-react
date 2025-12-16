import React, { Fragment, useCallback, useState } from 'react';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import FundProvider from '../../../../props/models/FundProvider';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Organization from '../../../../props/models/Organization';
import useConfirmFundProviderUpdate from '../hooks/useConfirmFundProviderUpdate';
import usePushApiError from '../../../../hooks/usePushApiError';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';
import useSetProgress from '../../../../hooks/useSetProgress';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function FundProviderTableItem({
    fundProvider,
    organization,
    onChange,
}: {
    fundProvider: FundProvider;
    organization: Organization;
    onChange: (data: FundProvider) => void;
}) {
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const confirmFundProviderUpdate = useConfirmFundProviderUpdate();

    const fundService = useFundService();

    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [submittingExcluded, setSubmittingExcluded] = useState(false);

    const updateProvider = useCallback(
        async (
            fundProvider: FundProvider,
            data: { state?: string; allow_budget?: boolean; allow_products?: boolean; excluded?: boolean },
        ) => {
            setProgress(0);
            setSubmitting(true);

            return await fundService
                .updateProvider(fundProvider.fund.organization_id, fundProvider.fund.id, fundProvider.id, data)
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    onChange(res.data.data);
                })
                .catch(pushApiError)
                .finally(() => {
                    setProgress(100);
                    setSubmitting(false);
                });
        },
        [fundService, onChange, pushApiError, pushSuccess, setProgress],
    );

    const updateFundProviderExcluded = useCallback(
        (fundProvider: FundProvider, data: { excluded?: boolean }) => {
            setSubmittingExcluded(true);
            updateProvider(fundProvider, data).finally(() => setSubmittingExcluded(false));
        },
        [updateProvider],
    );

    const updateFundProviderState = useCallback(
        (fundProvider: FundProvider, accepted: boolean) => {
            confirmFundProviderUpdate(fundProvider, accepted ? 'accepted' : 'rejected')
                .then((data) => data && updateProvider(fundProvider, data))
                .catch((r) => r);
        },
        [confirmFundProviderUpdate, updateProvider],
    );

    return (
        <StateNavLink
            customElement={'tr'}
            className={'tr-clickable'}
            name={DashboardRoutes.FUND_PROVIDER}
            params={{
                id: fundProvider.id,
                fundId: fundProvider.fund_id,
                organizationId: organization.id,
            }}>
            <td className="nowrap">
                <TableEntityMain
                    title={fundProvider.fund.name}
                    subtitle={fundProvider.organization.name}
                    media={fundProvider.fund.logo}
                    mediaRound={false}
                    mediaSize={'md'}
                    mediaPlaceholder={'fund'}
                />
            </td>
            <td>
                <div
                    className={`label label-${
                        { accepted: 'success', pending: 'default', rejected: 'danger', unsubscribed: 'danger-light' }[
                            fundProvider.state
                        ]
                    }`}>
                    {fundProvider.state_locale}
                </div>
            </td>
            <td>
                {fundProvider.state == 'pending' ? (
                    <TableEmptyValue />
                ) : (
                    <Fragment>
                        {fundProvider.state == 'rejected' && <div className="text-strong">Nee</div>}

                        <div>
                            {fundProvider.state == 'rejected' && <span className="mdi mdi-backup-restore"> </span>}

                            <span
                                className={
                                    fundProvider.state == 'rejected'
                                        ? 'text-line-through text-small text-muted'
                                        : 'text-strong'
                                }>
                                {fundProvider.allow_budget ? 'Ja' : 'Nee'}
                            </span>
                        </div>
                    </Fragment>
                )}
            </td>
            <td>
                {fundProvider.state == 'pending' ? (
                    <div className="text-muted">-</div>
                ) : (
                    <Fragment>
                        {fundProvider.state == 'rejected' && <div className="text-strong">Nee</div>}

                        <div>
                            {fundProvider.state == 'rejected' && <em className="mdi mdi-backup-restore" />}

                            {['accepted', 'rejected'].includes(fundProvider.state) && (
                                <Fragment>
                                    {fundProvider.allow_products ? (
                                        <span
                                            className={
                                                fundProvider.state == 'rejected'
                                                    ? 'text-line-through text-small text-muted'
                                                    : 'text-strong'
                                            }>
                                            Alle
                                        </span>
                                    ) : (
                                        <span
                                            className={
                                                fundProvider.state == 'rejected'
                                                    ? 'text-line-through text-small text-muted'
                                                    : 'text-strong'
                                            }>
                                            {`${fundProvider.products_count_approved} van ${fundProvider.products_count_available}`}
                                        </span>
                                    )}
                                </Fragment>
                            )}
                        </div>
                    </Fragment>
                )}
            </td>
            <td>
                <div className="card-block card-block-listing card-block-listing-inline card-block-listing-variant">
                    <ToggleControl
                        disabled={fundProvider.state != 'accepted' || submittingExcluded}
                        checked={fundProvider.excluded}
                        onClick={(e) => e?.stopPropagation()}
                        onChange={(e) => updateFundProviderExcluded(fundProvider, { excluded: e.target.checked })}
                    />
                </div>
            </td>
            <td className={'table-td-actions text-right'}>
                <TableRowActions
                    buttons={
                        <Fragment>
                            {(fundProvider.state == 'pending' || fundProvider.state == 'accepted') && !isSubmitting && (
                                <div
                                    className={'button button-text button-menu'}
                                    onClick={(e) => {
                                        e?.preventDefault();
                                        e?.stopPropagation();
                                        updateFundProviderState(fundProvider, false);
                                    }}>
                                    <em className="mdi mdi-close-circle-outline" />
                                </div>
                            )}

                            {(fundProvider.state == 'pending' || fundProvider.state == 'rejected') && !isSubmitting && (
                                <div
                                    className={'button button-text button-menu'}
                                    onClick={(e) => {
                                        e?.preventDefault();
                                        e?.stopPropagation();
                                        updateFundProviderState(fundProvider, true);
                                    }}>
                                    <em className="mdi mdi-play-circle-outline" />
                                </div>
                            )}

                            {isSubmitting && (
                                <div className={'button button-text button-menu disabled'}>
                                    <em className="mdi mdi-loading mdi-spin" />
                                </div>
                            )}
                        </Fragment>
                    }
                    content={() => (
                        <div className="dropdown dropdown-actions">
                            <StateNavLink
                                name={DashboardRoutes.FUND_PROVIDER}
                                params={{
                                    id: fundProvider.id,
                                    fundId: fundProvider.fund_id,
                                    organizationId: organization.id,
                                }}
                                className="dropdown-item">
                                <em className="mdi mdi-eye-outline icon-start" />
                                Bekijken
                            </StateNavLink>
                        </div>
                    )}
                />
            </td>
        </StateNavLink>
    );
}
