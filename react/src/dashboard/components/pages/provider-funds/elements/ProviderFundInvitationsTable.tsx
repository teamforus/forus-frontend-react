import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useFilter from '../../../../hooks/useFilter';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import FundProviderInvitation from '../../../../props/models/FundProviderInvitation';
import useFundProviderInvitationsService from '../../../../services/useFundProviderInvitationsService';
import { strLimit } from '../../../../helpers/string';
import useTableToggles from '../../../../hooks/useTableToggles';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import useTranslate from '../../../../hooks/useTranslate';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import usePushApiError from '../../../../hooks/usePushApiError';
import Label, { LabelType } from '../../../elements/image_cropper/Label';

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

    const filter = useFilter({
        q: '',
        from: '',
        to: '',
        state: null,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const { selected, setSelected, toggleAll, toggle } = useTableToggles();
    const selectedMeta = useMemo(() => {
        const list = invitations?.data?.filter((item) => selected?.includes(item.id));

        return {
            selected: list,
            selected_active: list?.filter((item) => item.can_be_accepted),
        };
    }, [invitations?.data, selected]);

    const { headElement, configsElement } = useConfigurableTable(fundProviderInvitationsService.getColumns(), {
        trPrepend: (
            <Fragment>
                {[null, 'pending'].includes(filter.values.state) && (
                    <th className="th-narrow">
                        <TableCheckboxControl
                            checked={selected.length == invitations?.data?.length}
                            onClick={(e) => toggleAll(e, invitations?.data)}
                        />
                    </th>
                )}
            </Fragment>
        ),
    });

    const acceptInvitations = useCallback(
        (invitations: Array<FundProviderInvitation> = []) => {
            const promises = invitations.map((item) => {
                return fundProviderInvitationsService.acceptInvitationById(organization.id, item.id);
            });

            Promise.all(promises)
                .then(() => pushSuccess('Uitnodiging succesvol geaccepteerd!'))
                .catch(pushApiError)
                .finally(() => {
                    filter.touch();
                    onChange?.();
                });
        },
        [filter, fundProviderInvitationsService, onChange, organization.id, pushApiError, pushSuccess],
    );

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

    const fetchInvitations = useCallback(
        async (filters: object) => {
            setLoading(true);
            setProgress(0);

            return fundProviderInvitationsService
                .listInvitations(organization.id, { ...filters, expired: type == 'invitations_archived' ? 1 : 0 })
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        },
        [organization.id, fundProviderInvitationsService, setProgress, type],
    );

    useEffect(() => {
        setSelected([]);

        fetchInvitations(filter.activeValues)
            .then((res) =>
                setInvitations({
                    data: mapProviderFunds(res.data.data),
                    meta: res.data.meta,
                }),
            )
            .catch(pushApiError);
    }, [fetchInvitations, filter.activeValues, mapProviderFunds, pushApiError, setSelected]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate(`provider_funds.title.${type}`)}

                    {!loading && selected.length > 0 && ` (${selected.length}/${invitations.data.length})`}
                    {!loading && selected.length == 0 && ` (${invitations.meta.total})`}
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
                                    value={filter.values.q}
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                    placeholder="Zoeken"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!loading && invitations.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table form">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {invitations.data?.map((invitation) => (
                                        <tr
                                            key={invitation.id}
                                            className={selected.includes(invitation.id) ? 'selected' : ''}>
                                            {[null, 'pending'].includes(filter.values.state) && (
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
                                                        <div
                                                            className="text-primary text-semibold"
                                                            title={invitation.fund.name}>
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
                                            <td className={`nowrap`}>
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
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {loading && (
                <div className="card-section">
                    <div className="card-loading">
                        <div className="mdi mdi-loading mdi-spin" />
                    </div>
                </div>
            )}

            {!loading && invitations?.meta?.total == 0 && (
                <EmptyCard type={'card-section'} title={translate(`provider_funds.empty_block.${type}`)} />
            )}

            {invitations?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={invitations.meta}
                        filters={filter.activeValues}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
