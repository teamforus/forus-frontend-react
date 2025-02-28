import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useFilter from '../../../../hooks/useFilter';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useFundUnsubscribeService from '../../../../services/FundUnsubscribeService';
import FundProviderUnsubscribe from '../../../../props/models/FundProviderUnsubscribe';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { strLimit } from '../../../../helpers/string';
import useTableToggles from '../../../../hooks/useTableToggles';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import useTranslate from '../../../../hooks/useTranslate';
import Tooltip from '../../../elements/tooltip/Tooltip';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import usePushApiError from '../../../../hooks/usePushApiError';

type FundProviderUnsubscribeLocal = FundProviderUnsubscribe & {
    showTooltip?: boolean;
};

export default function ProviderFundUnsubscriptionsTable({
    organization,
    onChange,
}: {
    organization: Organization;
    onChange: () => void;
}) {
    const [loading, setLoading] = useState(true);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const fundUnsubscribeService = useFundUnsubscribeService();

    const [paginatorKey] = useState('provider_funds_unsubscriptions');

    const [states] = useState([
        { key: null, label: 'Alle' },
        { key: 'pending', label: 'In afwachting' },
        { key: 'approved', label: 'Goedgekeurd' },
        { key: 'canceled', label: 'Geannuleerd' },
    ]);

    const filter = useFilter({
        q: '',
        state: null,
        per_page: paginatorService.getPerPage(paginatorKey),
        from: '',
        to: '',
    });

    const [fundUnsubscriptions, setFundUnsubscriptions] = useState<PaginationData<FundProviderUnsubscribeLocal>>(null);

    const { selected, setSelected, toggleAll, toggle } = useTableToggles();

    const selectedMeta = useMemo(() => {
        const list = fundUnsubscriptions?.data?.filter((item) => selected?.includes(item.id));

        return {
            selected: list,
            selected_cancel: list?.filter((item) => item.can_cancel),
        };
    }, [fundUnsubscriptions?.data, selected]);

    const { headElement, configsElement } = useConfigurableTable(fundUnsubscribeService.getColumns(), {
        trPrepend: (
            <Fragment>
                {[null, 'pending'].includes(filter.values.state) && (
                    <th className="th-narrow">
                        <TableCheckboxControl
                            checked={selected.length == fundUnsubscriptions?.data?.length}
                            onClick={(e) => toggleAll(e, fundUnsubscriptions?.data)}
                        />
                    </th>
                )}
            </Fragment>
        ),
    });

    const cancelUnsubscriptions = useCallback(
        (unsubscriptions: Array<FundProviderUnsubscribe>) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.cancel_provider_unsubscription.title')}
                    description={translate('modals.danger_zone.cancel_provider_unsubscription.description')}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.cancel_provider_unsubscription.buttons.cancel'),
                        onClick: () => {
                            const promises = unsubscriptions.map((item) => {
                                return fundUnsubscribeService.update(organization.id, item.id, { canceled: 1 });
                            });

                            Promise.all(promises)
                                .then(() => pushSuccess('Opgeslagen!'))
                                .catch(pushApiError)
                                .finally(() => {
                                    filter.touch();
                                    modal.close();
                                    onChange?.();
                                });
                        },
                    }}
                    buttonCancel={{
                        text: translate('modals.danger_zone.cancel_provider_unsubscription.buttons.confirm'),
                        onClick: modal.close,
                    }}
                />
            ));
        },
        [filter, fundUnsubscribeService, onChange, openModal, organization.id, pushApiError, pushSuccess, translate],
    );

    const fetchUnsubscriptions = useCallback(
        async (filters: object) => {
            setLoading(true);
            setProgress(0);

            return fundUnsubscribeService.listProvider(organization.id, filters).finally(() => {
                setLoading(false);
                setProgress(100);
            });
        },
        [organization.id, fundUnsubscribeService, setProgress],
    );

    useEffect(() => {
        setSelected([]);

        fetchUnsubscriptions(filter.activeValues)
            .then((res) => setFundUnsubscriptions(res.data))
            .catch(pushApiError);
    }, [fetchUnsubscriptions, filter.activeValues, pushApiError, setSelected]);

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow">
                    {translate(`fund_unsubscriptions.title`)}

                    {!loading && selected.length > 0 && ` (${selected.length}/${fundUnsubscriptions.data.length})`}
                    {!loading && selected.length == 0 && ` (${fundUnsubscriptions.meta.total})`}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {selectedMeta?.selected_cancel?.length > 0 && (
                            <button
                                type={'button'}
                                className="button button-danger button-sm"
                                disabled={selectedMeta?.selected_cancel?.length !== selected.length}
                                onClick={() => cancelUnsubscriptions(selectedMeta?.selected_cancel)}>
                                <em className="mdi mdi-close-circle-outline icon-start" />
                                Annuleren
                            </button>
                        )}
                        <div className="flex-col">
                            <div className="block block-label-tabs">
                                <div className="label-tab-set">
                                    {states?.map((state) => (
                                        <div
                                            key={state.key}
                                            className={`label-tab label-tab-sm ${
                                                filter.values.state == state.key ? 'active' : ''
                                            }`}
                                            onClick={() => filter.update({ state: state.key })}>
                                            {state.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={filter.resetFilters}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
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
                        )}
                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle label={translate('provider_funds.filters.labels.search')} show={true}>
                                <input
                                    className="form-control"
                                    value={filter.values.q}
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                    placeholder="Zoeken"
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('transactions.labels.from')}>
                                <DatePickerControl
                                    value={dateParse(filter.values.from)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(from: Date) => {
                                        filter.update({ from: dateFormat(from) });
                                    }}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('transactions.labels.to')}>
                                <DatePickerControl
                                    value={dateParse(filter.values.to)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(to: Date) => {
                                        filter.update({ to: dateFormat(to) });
                                    }}
                                />
                            </FilterItemToggle>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>
            {!loading && fundUnsubscriptions.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table form">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {fundUnsubscriptions.data?.map((unsubscription) => (
                                        <tr
                                            key={unsubscription.id}
                                            className={selected.includes(unsubscription.id) ? 'selected' : ''}>
                                            {[null, 'pending'].includes(filter.values.state) && (
                                                <td className="td-narrow">
                                                    <TableCheckboxControl
                                                        checked={selected.includes(unsubscription.id)}
                                                        onClick={(e) => toggle(e, unsubscription)}
                                                    />
                                                </td>
                                            )}

                                            <td>
                                                <div className="td-collapsable">
                                                    <div className="collapsable-media">
                                                        <img
                                                            src={
                                                                unsubscription.fund_provider?.fund?.logo?.sizes
                                                                    ?.thumbnail ||
                                                                assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                                            }
                                                            className="td-media td-media-sm"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="collapsable-content">
                                                        <div className="text-primary text-semibold">
                                                            {unsubscription.fund_provider.fund.name}
                                                        </div>
                                                        <a
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            href={unsubscription.fund.implementation.url_webshop}
                                                            className="text-strong text-md text-muted-dark text-inherit">
                                                            {strLimit(unsubscription.fund.implementation?.name, 40)}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td title={unsubscription.fund_provider.fund.organization.name}>
                                                {strLimit(unsubscription.fund_provider.fund.organization.name)}
                                            </td>
                                            <td className="nowrap">
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {unsubscription.created_at_locale}
                                                </strong>
                                            </td>
                                            <td className="nowrap">
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {unsubscription.unsubscribe_at_locale}
                                                </strong>
                                            </td>
                                            <td title="{{ unsubscription.note }}">
                                                {unsubscription.note ? (
                                                    <div className="flex">
                                                        <span>{strLimit(unsubscription.note)}</span>
                                                        &nbsp;
                                                        {unsubscription.note?.length >= 25 && (
                                                            <Tooltip
                                                                type={'primary'}
                                                                position={'bottom'}
                                                                text={strLimit(unsubscription.note || '-', 512)}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td className="nowrap">
                                                {unsubscription.state == 'approved' && (
                                                    <div className="tag tag-sm tag-success">
                                                        {unsubscription.state_locale}
                                                    </div>
                                                )}

                                                {unsubscription.state == 'pending' && (
                                                    <div className="tag tag-sm tag-warning">
                                                        {unsubscription.state_locale}
                                                    </div>
                                                )}

                                                {unsubscription.state == 'overdue' && (
                                                    <div className="tag tag-sm tag-danger">
                                                        {unsubscription.state_locale}
                                                    </div>
                                                )}

                                                {unsubscription.state == 'canceled' && (
                                                    <div className="tag tag-sm tag-default">
                                                        {unsubscription.state_locale}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={'table-td-actions text-right'}>
                                                {unsubscription.can_cancel ? (
                                                    <TableRowActions
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                <div
                                                                    className="dropdown-item"
                                                                    title="Cancel"
                                                                    onClick={() => {
                                                                        cancelUnsubscriptions([unsubscription]);
                                                                        e.close();
                                                                    }}>
                                                                    <em className="mdi mdi-close-circle-outline icon-start" />
                                                                    Annuleren
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

            {!loading && fundUnsubscriptions?.meta?.total == 0 && (
                <EmptyCard type={'card-section'} title={translate(`provider_funds.empty_block.unsubscriptions`)} />
            )}

            {fundUnsubscriptions?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={fundUnsubscriptions.meta}
                        filters={filter.activeValues}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
