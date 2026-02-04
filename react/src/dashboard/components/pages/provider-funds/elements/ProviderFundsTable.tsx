import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { PaginationData } from '../../../../props/ApiResponses';
import FundProvider from '../../../../props/models/FundProvider';
import Organization from '../../../../props/models/Organization';
import useProviderFundService from '../../../../services/ProviderFundService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { strLimit } from '../../../../helpers/string';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import ModalFundOffers from '../../../modals/ModalFundOffers';
import ModalFundUnsubscribe from '../../../modals/ModalFundUnsubscribe';
import useTableToggles from '../../../../hooks/useTableToggles';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import usePushApiError from '../../../../hooks/usePushApiError';
import Label from '../../../elements/image_cropper/Label';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import useProviderFundsApplySuccess from '../hooks/useProviderFundsApplySuccess';
import useProviderFundsFailOfficesCheck from '../hooks/useProviderFundsFailOfficesCheck';

export default function ProviderFundsTable({
    type,
    organization,
    onChange,
}: {
    type: 'active' | 'pending_rejected' | 'archived' | 'unsubscribed';
    organization: Organization;
    onChange: () => void;
}) {
    const [loading, setLoading] = useState(true);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const successApplying = useProviderFundsApplySuccess();
    const failOfficesCheck = useProviderFundsFailOfficesCheck();

    const paginatorService = usePaginatorService();
    const providerFundService = useProviderFundService();

    const [paginatorKey] = useState(`provider_funds_${type}`);
    const [providerFunds, setProviderFunds] = useState<PaginationData<FundProvider>>(null);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{ q: string; per_page?: number }>(
        { q: '', per_page: paginatorService.getPerPage(paginatorKey) },
        { queryParams: { q: StringParam, per_page: NumberParam } },
    );

    const { resetFilters: resetFilters } = filter;

    const { selected, setSelected, toggleAll, toggle } = useTableToggles();

    const selectedMeta = useMemo(() => {
        const list = providerFunds?.data?.filter((item) => selected?.includes(item.id));

        return {
            selected: list,
            selected_cancel: list?.filter((item) => item.can_cancel),
        };
    }, [providerFunds?.data, selected]);

    const viewOffers = useCallback(
        (providerFund: FundProvider) => {
            openModal((modal) => (
                <ModalFundOffers modal={modal} providerFund={providerFund} organization={organization} />
            ));
        },
        [openModal, organization],
    );

    const fetchFunds = useCallback(() => {
        setSelected([]);
        setLoading(true);
        setProgress(0);

        providerFundService
            .listFunds(organization.id, {
                active: type == 'active' ? 1 : 0,
                pending: type == 'pending_rejected' ? 1 : 0,
                unsubscribed: type == 'unsubscribed' ? 1 : 0,
                archived: type == 'archived' ? 1 : 0,
                ...filterValuesActive,
            })
            .then((res) => setProviderFunds(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [filterValuesActive, organization.id, providerFundService, pushApiError, setProgress, setSelected, type]);

    const cancelApplications = useCallback(
        (providerFunds: Array<FundProvider>) => {
            const sponsor_organization_name =
                providerFunds.length == 1 ? providerFunds[0]?.fund?.organization?.name || '' : '';

            openModal((modal) => {
                return (
                    <ModalDangerZone
                        modal={modal}
                        title={translate('modals.danger_zone.remove_provider_application.title')}
                        description={translate('modals.danger_zone.remove_provider_application.description', {
                            sponsor_organization_name,
                        })}
                        buttonCancel={{
                            text: translate('modals.danger_zone.remove_provider_application.buttons.cancel'),
                            onClick: () => modal.close(),
                        }}
                        buttonSubmit={{
                            text: translate('modals.danger_zone.remove_provider_application.buttons.confirm'),
                            onClick: () => {
                                modal.close();
                                setProgress(0);

                                const promises = providerFunds.map((provider) =>
                                    providerFundService.cancelApplication(organization.id, provider.id),
                                );

                                Promise.all(promises)
                                    .then(() => pushSuccess('Opgeslagen!'))
                                    .catch(pushApiError)
                                    .finally(() => {
                                        setProgress(100);
                                        fetchFunds();
                                        onChange?.();
                                    });
                            },
                        }}
                    />
                );
            });
        },
        [
            fetchFunds,
            onChange,
            openModal,
            organization.id,
            providerFundService,
            pushApiError,
            pushSuccess,
            setProgress,
            translate,
        ],
    );

    const unsubscribe = useCallback(
        (providerFund: FundProvider) => {
            openModal((modal) => (
                <ModalFundUnsubscribe
                    modal={modal}
                    providerFund={providerFund}
                    organization={organization}
                    onUnsubscribe={() => {
                        fetchFunds();
                        onChange?.();
                    }}
                />
            ));
        },
        [fetchFunds, onChange, openModal, organization],
    );

    const applyFund = useCallback(
        (providerFund: FundProvider) => {
            if (organization.offices_count == 0) {
                return failOfficesCheck();
            }

            setProgress(0);

            providerFundService
                .applyForFund(organization.id, providerFund.fund.id)
                .then(() => {
                    successApplying();
                    setSelected([]);
                })
                .catch(pushApiError)
                .finally(() => {
                    fetchFunds();
                    setProgress(100);
                    onChange?.();
                });
        },
        [
            failOfficesCheck,
            fetchFunds,
            onChange,
            organization.id,
            organization.offices_count,
            providerFundService,
            pushApiError,
            setSelected,
            setProgress,
            successApplying,
        ],
    );

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        return () => {
            resetFilters();
        };
    }, [resetFilters]);

    return (
        <div className="card" data-dusk={`${type}TableFundsContent`}>
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate(`provider_funds.title.${type}`)}

                    {!loading && selected.length > 0 && ` (${selected.length}/${providerFunds.data.length})`}
                    {!loading && selected.length == 0 && ` (${providerFunds?.meta?.total})`}
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {selectedMeta?.selected_cancel?.length > 0 && (
                            <button
                                type={'button'}
                                className="button button-danger button-sm"
                                disabled={selectedMeta?.selected_cancel?.length !== selected.length}
                                onClick={() => cancelApplications(selectedMeta?.selected_cancel)}>
                                <em className="mdi mdi-close-circle-outline icon-start" />
                                {translate('provider_funds.labels.cancel_application')}
                            </button>
                        )}

                        <div className="form">
                            <div className="form-group">
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder="Zoeken"
                                    data-dusk={`${type}TableFundsSearch`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={!loading && providerFunds?.meta?.total == 0}
                emptyTitle={translate(`provider_funds.empty_block.${type}`)}
                columns={providerFundService.getColumns(type)}
                tableOptions={{
                    trPrepend: (
                        <Fragment>
                            {type !== 'archived' && (
                                <th className="th-narrow">
                                    <TableCheckboxControl
                                        checked={selected.length == providerFunds?.data?.length}
                                        onClick={(e) => toggleAll(e, providerFunds?.data)}
                                    />
                                </th>
                            )}
                        </Fragment>
                    ),
                }}
                paginator={{ key: paginatorKey, data: providerFunds, filterValues, filterUpdate }}>
                {providerFunds?.data?.map((providerFund) => (
                    <tr
                        key={providerFund.id}
                        className={classNames(selected.includes(providerFund.id) && 'selected')}
                        data-dusk={`${type}TableFundsRow${providerFund.id}`}>
                        {type !== 'archived' && (
                            <td className="td-narrow">
                                <TableCheckboxControl
                                    checked={selected.includes(providerFund.id)}
                                    onClick={(e) => toggle(e, providerFund)}
                                />
                            </td>
                        )}
                        <td>
                            <div className="td-collapsable">
                                <div className="collapsable-media">
                                    <img
                                        className="td-media td-media-sm"
                                        src={
                                            providerFund.fund.logo?.sizes?.thumbnail ||
                                            assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                        }
                                        alt=""
                                    />
                                </div>
                                <div className="collapsable-content">
                                    <div className="text-primary text-semibold" title={providerFund.fund.name}>
                                        {strLimit(providerFund.fund.name, 32)}
                                    </div>
                                    <a
                                        href={providerFund.fund.implementation.url_webshop}
                                        target="_blank"
                                        className="text-strong text-md text-muted-dark text-inherit"
                                        rel="noreferrer">
                                        {strLimit(providerFund.fund.implementation?.name, 32)}
                                    </a>
                                </div>
                            </div>
                        </td>
                        <td title={providerFund.fund?.organization?.name}>
                            {strLimit(providerFund.fund?.organization?.name, 25)}
                        </td>
                        <td className="nowrap">
                            <strong className="text-strong text-md text-muted-dark">
                                {providerFund.fund?.start_date_locale}
                            </strong>
                        </td>
                        <td className="nowrap">
                            <strong className="text-strong text-md text-muted-dark">
                                {providerFund.fund?.end_date_locale}
                            </strong>
                        </td>
                        {type === 'active' && (
                            <td className="nowrap">{providerFund.fund?.fund_amount_locale || '-'}</td>
                        )}
                        <td>{providerFund.allow_budget ? 'Ja' : 'Nee'}</td>
                        <td>{providerFund.allow_some_products || providerFund.allow_products ? 'Ja' : 'Nee'}</td>
                        {!providerFund.fund.archived && !providerFund.fund.expired && (
                            <td className="nowrap">
                                {providerFund.state == 'accepted' && (
                                    <Label type="success">{providerFund.state_locale}</Label>
                                )}

                                {providerFund.state == 'pending' && (
                                    <Label type="warning">{providerFund.state_locale}</Label>
                                )}

                                {providerFund.state == 'rejected' && (
                                    <Label type="danger">{providerFund.state_locale}</Label>
                                )}

                                {providerFund.state == 'unsubscribed' && (
                                    <Label type="danger_light">{providerFund.state_locale}</Label>
                                )}
                            </td>
                        )}

                        {(providerFund.fund.archived || providerFund.fund.expired) && (
                            <td className="nowrap">
                                <Label type="default">Archived</Label>
                            </td>
                        )}

                        {type !== 'archived' ? (
                            <td className={'table-td-actions text-right'}>
                                <TableRowActions
                                    dataDusk={'btnFundProviderMenu'}
                                    content={(e) => (
                                        <div className="dropdown dropdown-actions">
                                            {providerFund.fund.state != 'closed' &&
                                                providerFund.state === 'unsubscribed' && (
                                                    <div
                                                        className="dropdown-item"
                                                        data-dusk={`btnApplyFund${providerFund.id}`}
                                                        title={translate('provider_funds.buttons.join_unsubscribed')}
                                                        onClick={() => {
                                                            applyFund(providerFund);
                                                            e.close();
                                                        }}>
                                                        <em className="mdi mdi-send-variant-clock-outline icon-start" />
                                                        {translate('provider_funds.buttons.join_unsubscribed')}
                                                    </div>
                                                )}

                                            {providerFund.fund.state != 'closed' && (
                                                <div
                                                    className="dropdown-item"
                                                    title="Bekijk"
                                                    onClick={() => {
                                                        viewOffers(providerFund);
                                                        e.close();
                                                    }}>
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                    Bekijk
                                                </div>
                                            )}

                                            {type == 'active' && (
                                                <div
                                                    className="dropdown-item"
                                                    data-dusk={`btnUnsubscribe${providerFund.id}`}
                                                    title="Uitschrijven"
                                                    onClick={() => {
                                                        unsubscribe(providerFund);
                                                        e.close();
                                                    }}>
                                                    <em className="mdi mdi-progress-close icon-start" />
                                                    Uitschrijven
                                                </div>
                                            )}

                                            {providerFund.can_cancel && (
                                                <div
                                                    className="dropdown-item"
                                                    title="Cancel"
                                                    onClick={() => {
                                                        cancelApplications([providerFund]);
                                                        e.close();
                                                    }}>
                                                    <em className="mdi mdi-close-circle-outline icon-start" />
                                                    Annuleren
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
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
