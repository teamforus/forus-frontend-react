import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import SelectControl from '../../../elements/select-control/SelectControl';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import useTranslate from '../../../../hooks/useTranslate';
import { PaginationData } from '../../../../props/ApiResponses';
import Fund from '../../../../props/models/Fund';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import Reservation from '../../../../props/models/Reservation';
import { FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import Product from '../../../../props/models/Product';
import useProductReservationsExporter from '../../../../services/exporters/useProductReservationsExporter';
import useProductService from '../../../../services/ProductService';
import useProviderFundService from '../../../../services/ProviderFundService';

export type ReservationsTableFiltersProps = {
    q?: string;
    to?: string;
    from?: string;
    type?: string;
    state?:
        | 'waiting'
        | 'pending'
        | 'accepted'
        | 'rejected'
        | 'expired'
        | 'canceled'
        | 'canceled_by_client'
        | 'canceled_by_sponsor'
        | 'canceled_payment_expired'
        | 'canceled_payment_canceled'
        | 'canceled_payment_failed';
    product_id?: number;
    fund_id?: number;
    per_page?: number;
    page?: number;
    order_by?: string;
    order_dir?: string;
};

export default function ReservationsTableFilters({
    organization,
    reservations,
    filter,
    filterValues,
    filterUpdate,
}: {
    organization: Organization;
    reservations: PaginationData<Reservation>;
    filter: FilterScope<ReservationsTableFiltersProps>;
    filterValues: ReservationsTableFiltersProps;
    filterUpdate: FilterSetter;
}) {
    const productService = useProductService();
    const providerFundService = useProviderFundService();

    const translate = useTranslate();
    const productReservationsExporter = useProductReservationsExporter();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [products, setProducts] = useState<Array<Partial<Product>>>(null);

    const [extraPaymentStates] = useState([
        { key: 'canceled_payment_expired', name: 'Geannuleerd door verlopen bijbetaling' }, // Canceled payment expired
        { key: 'canceled_payment_canceled', name: 'Geannuleerd door ingetrokken bijbetaling' }, // Canceled payment canceled
        { key: 'canceled_payment_failed', name: 'Geannuleerd door mislukte bijbetaling' }, // Canceled payment failed
    ]);

    const [states] = useState([
        { key: null, name: 'Alle' }, // All
        { key: 'waiting', name: 'Wachtend op bijbetaling' }, // Waiting
        { key: 'pending', name: 'In afwachting' }, // Pending
        { key: 'accepted', name: 'Geaccepteerd' }, // Accepted
        { key: 'rejected', name: 'Geweigerd' }, // Rejected
        { key: 'expired', name: 'Verlopen' }, // Expired
        { key: 'canceled', name: 'Geannuleerd door aanbieder' }, // Canceled by provider
        { key: 'canceled_by_client', name: 'Geannuleerd door aanvrager' }, // Canceled by client
        { key: 'canceled_by_sponsor', name: 'Geannuleerd door sponsor' }, // Canceled by sponsor
        ...(organization.can_view_provider_extra_payments ? extraPaymentStates : []), // Extra payment states
    ]);

    const exportReservations = useCallback(() => {
        productReservationsExporter.exportData(organization.id, filterValues);
    }, [organization.id, filterValues, productReservationsExporter]);

    useEffect(() => {
        providerFundService.listFunds(organization.id, { per_page: 100 }).then((res) => {
            setFunds([{ id: null, name: 'Alle tegoeden' }, ...res.data.data.map((item) => item.fund)]);
        });

        productService.list(organization.id, { per_page: 100 }).then((res) => {
            setProducts([{ id: null, name: 'Alle aanbod' }, ...res.data.data]);
        });
    }, [organization, productService, providerFundService]);

    return (
        <Fragment>
            {filter.show ? (
                <div className="button button-text" onClick={filter.resetFilters}>
                    <em className="mdi mdi-close icon-start" />
                    <span>Wis filters</span>
                </div>
            ) : (
                <div className="form">
                    <div className="form-group">
                        <input
                            className="form-control"
                            value={filter.values.q}
                            data-dusk="tableReservationSearch"
                            placeholder={translate('reservations.filters.search')}
                            onChange={(e) => filterUpdate({ q: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <CardHeaderFilter filter={filter}>
                <FilterItemToggle label={translate('reservations.filters.search')} show={true}>
                    <input
                        className="form-control"
                        value={filter.values.q}
                        onChange={(e) => filterUpdate({ q: e.target.value })}
                        placeholder={translate('reservations.filters.search')}
                    />
                </FilterItemToggle>

                <FilterItemToggle label={translate('reservations.filters.fund')}>
                    {funds && (
                        <SelectControl
                            className="form-control"
                            propKey={'id'}
                            allowSearch={false}
                            options={funds}
                            onChange={(fund_id: number) => filterUpdate({ fund_id })}
                        />
                    )}
                </FilterItemToggle>

                <FilterItemToggle label={translate('reservations.filters.product')}>
                    {products && (
                        <SelectControl
                            className="form-control"
                            propKey={'id'}
                            allowSearch={true}
                            options={products}
                            onChange={(product_id: number) => filterUpdate({ product_id })}
                        />
                    )}
                </FilterItemToggle>

                <FilterItemToggle label={translate('reservations.filters.from')}>
                    <DatePickerControl
                        value={dateParse(filter.values.from)}
                        placeholder={translate('jjjj-MM-dd')}
                        onChange={(from: Date) => {
                            filterUpdate({ from: dateFormat(from) });
                        }}
                    />
                </FilterItemToggle>

                <FilterItemToggle label={translate('reservations.filters.to')}>
                    <DatePickerControl
                        value={dateParse(filter.values.to)}
                        placeholder={translate('jjjj-MM-dd')}
                        onChange={(to: Date) => {
                            filterUpdate({ to: dateFormat(to) });
                        }}
                    />
                </FilterItemToggle>

                <FilterItemToggle label={translate('reservations.filters.state')}>
                    <SelectControl
                        className="form-control"
                        propKey={'key'}
                        allowSearch={false}
                        value={filter.values.state}
                        options={states}
                        onChange={(state: ReservationsTableFiltersProps['state']) => filterUpdate({ state })}
                    />
                </FilterItemToggle>

                <div className="form-actions">
                    <button
                        className="button button-primary button-wide"
                        onClick={() => exportReservations()}
                        data-dusk="export"
                        disabled={reservations.meta.total == 0}>
                        <em className="mdi mdi-download icon-start"> </em>
                        {translate('components.dropdown.export', {
                            total: reservations.meta.total,
                        })}
                    </button>
                </div>
            </CardHeaderFilter>
        </Fragment>
    );
}
