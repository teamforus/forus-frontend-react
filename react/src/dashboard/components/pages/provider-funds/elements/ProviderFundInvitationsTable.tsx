import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import FundProviderInvitation from '../../../../props/models/FundProviderInvitation';
import useFundProviderInvitationsService from '../../../../services/useFundProviderInvitationsService';
import { strLimit } from '../../../../helpers/string';
import useTableToggles from '../../../../hooks/useTableToggles';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import usePushApiError from '../../../../hooks/usePushApiError';
import Label, { LabelType } from '../../../elements/label/Label';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';

type FundProviderInvitationLocal = FundProviderInvitation & {
    status_type?: LabelType;
    status_text?: string;
};

export default function ProviderFundInvitationsTable({
    type,
    organization,
    onChange,
}: {
    type: 'invitations' | 'invitations_archived';
    organization: Organization;
    onChange: () => void;
}) {
    const [loading, setLoading] = useState(true);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const fundProviderInvitationsService = useFundProviderInvitationsService();

    const [invitations, setInvitations] = useState<PaginationData<FundProviderInvitationLocal>>(null);
    const [paginatorKey] = useState(`provider_fund_${type}`);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        from?: string;
        to?: string;
        state?: string;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            from: '',
            to: '',
            state: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                from: StringParam,
                to: StringParam,
                state: StringParam,
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const { resetFilters: resetFilters } = filter;

    const { selected, setSelected, toggleAll, toggle } = useTableToggles();
    const selectedMeta = useMemo(() => {
        const list = invitations?.data?.filter((item) => selected?.includes(item.id));

        return {
            selected: list,
            selected_active: list?.filter((item) => item.can_be_accepted),
        };
    }, [invitations?.data, selected]);

    const mapProviderFunds = useCallback(
        (
            items: Array<FundProviderInvitation>,
        ): Array<FundProviderInvitation & { status_text: string; status_type: LabelType }> => {
            return items.map(function (item) {
                if (item.state) {
                    return {
                        ...item,
                        status_text: translate(`provider_funds.status.${item.expired ? 'expired' : item.state}`),
                        status_type:
                            item.state == 'pending' && !item.expired ? 'warning' : item.expired ? 'default' : 'success',
                    };
                }

                return {
                    ...item,
                    status_text: translate('provider_funds.status.closed'),
                    status_type: 'default',
                };
            });
        },
        [translate],
    );

    const fetchInvitations = useCallback(() => {
        setSelected([]);
        setLoading(true);
        setProgress(0);

        fundProviderInvitationsService
            .listInvitations(organization.id, {
                ...filterValuesActive,
                expired: type == 'invitations_archived' ? 1 : 0,
            })
            .then((res) =>
                setInvitations({
                    data: mapProviderFunds(res.data.data),
                    meta: res.data.meta,
                }),
            )
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [
        setSelected,
        setProgress,
        fundProviderInvitationsService,
        organization.id,
        filterValuesActive,
        type,
        pushApiError,
        mapProviderFunds,
    ]);

    const acceptInvitations = useCallback(
        (invitations: Array<FundProviderInvitation> = []) => {
            const promises = invitations.map((item) => {
                return fundProviderInvitationsService.acceptInvitationById(organization.id, item.id);
            });

            Promise.all(promises)
                .then(() => pushSuccess('Uitnodiging succesvol geaccepteerd!'))
                .catch(pushApiError)
                .finally(() => {
                    fetchInvitations();
                    onChange?.();
                });
        },
        [fetchInvitations, fundProviderInvitationsService, onChange, organization.id, pushApiError, pushSuccess],
    );

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    useEffect(() => {
        return () => {
            resetFilters();
        };
    }, [resetFilters]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate(`provider_funds.title.${type}`)}

                    {!loading && selected.length > 0 && ` (${selected.length}/${invitations.data.length})`}
                    {!loading && selected.length == 0 && ` (${invitations?.meta?.total})`}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {selectedMeta?.selected_active?.length > 0 && (
                            <button
                                type={'button'}
                                className="button button-primary button-sm"
                                disabled={selectedMeta?.selected_active?.length !== selected.length}
                                onClick={() => acceptInvitations(selectedMeta?.selected_active)}>
                                {translate('provider_funds.labels.accept_invitation')}
                            </button>
                        )}

                        <div className="form">
                            <div className="form-group">
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder="Zoeken"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={!loading && invitations?.meta?.total == 0}
                emptyTitle={translate(`provider_funds.empty_block.${type}`)}
                columns={fundProviderInvitationsService.getColumns()}
                tableOptions={{
                    trPrepend: (
                        <Fragment>
                            {[null, 'pending'].includes(filterValues.state) && (
                                <th className="th-narrow">
                                    <TableCheckboxControl
                                        checked={selected.length == invitations?.data?.length}
                                        onClick={(e) => toggleAll(e, invitations?.data)}
                                    />
                                </th>
                            )}
                        </Fragment>
                    ),
                }}
                paginator={{ key: paginatorKey, data: invitations, filterValues, filterUpdate }}>
                {invitations?.data?.map((invitation) => (
                    <tr key={invitation.id} className={classNames(selected.includes(invitation.id) && 'selected')}>
                        {[null, 'pending'].includes(filterValues.state) && (
                            <td className="td-narrow">
                                <TableCheckboxControl
                                    checked={selected.includes(invitation.id)}
                                    onClick={(e) => toggle(e, invitation)}
                                />
                            </td>
                        )}
                        <td>
                            <div className="td-collapsable">
                                <div className="collapsable-media">
                                    <img
                                        className="td-media td-media-sm"
                                        src={
                                            invitation.fund?.logo?.sizes?.thumbnail ||
                                            assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                        }
                                        alt=""
                                    />
                                </div>
                                <div className="collapsable-content">
                                    <div className="text-primary text-semibold" title={invitation.fund.name}>
                                        {strLimit(invitation.fund.name, 32)}
                                    </div>
                                    <a
                                        href={invitation.fund.implementation?.url_webshop}
                                        target="_blank"
                                        className="text-strong text-md text-muted-dark text-inherit"
                                        rel="noreferrer">
                                        {strLimit(invitation.fund.implementation?.name, 32)}
                                    </a>
                                </div>
                            </div>
                        </td>

                        <td title={invitation.fund?.organization?.name}>
                            {strLimit(invitation.fund?.organization?.name, 25)}
                        </td>

                        <td className="nowrap">
                            <strong className="text-strong text-md text-muted-dark">
                                {invitation.fund?.start_date_locale}
                            </strong>
                        </td>
                        <td className="nowrap">
                            <strong className="text-strong text-md text-muted-dark">
                                {invitation.fund?.end_date_locale}
                            </strong>
                        </td>
                        <td className="nowrap">
                            <Label type={invitation.status_type}>{invitation.status_text}</Label>
                        </td>
                        {type === 'invitations' && invitation.can_be_accepted ? (
                            <td>
                                <div className="button-group flex-end">
                                    <div
                                        className="button button-primary button-sm"
                                        onClick={() => acceptInvitations([invitation])}>
                                        <em className="mdi mdi-check-circle icon-start" />
                                        {translate('provider_funds.labels.accept_invitation')}
                                    </div>
                                </div>
                            </td>
                        ) : (
                            <td className={'table-td-actions text-right'}>
                                <TableEmptyValue />
                            </td>
                        )}
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
