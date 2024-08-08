import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import Voucher from '../../../../props/models/Voucher';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useFilter from '../../../../hooks/useFilter';
import useVoucherService from '../../../../services/VoucherService';
import usePushDanger from '../../../../hooks/usePushDanger';
import Identity from '../../../../props/models/Sponsor/Identity';
import useSetProgress from '../../../../hooks/useSetProgress';
import useTranslate from '../../../../hooks/useTranslate';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import Tooltip from '../../../elements/tooltip/Tooltip';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

export default function IdentityVouchersCard({
    organization,
    fund,
    identity,
    blockTitle,
}: {
    organization: Organization;
    fund: Fund;
    identity: Identity;
    blockTitle: string;
}) {
    const translate = useTranslate();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();

    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);

    const filter = useFilter({
        order_by: 'id',
        order_dir: 'asc',
        per_page: 10,
        type: 'all',
        source: 'all',
        fund_id: fund.id,
        identity_address: identity.address,
    });

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .index(organization.id, filter?.activeValues)
            .then((res) => setVouchers(res.data))
            .catch((err: ResponseError) => pushDanger('Error!', err.data.message))
            .finally(() => setProgress(100));
    }, [filter?.activeValues, organization.id, pushDanger, voucherService, setProgress]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{`${blockTitle || 'Tegoeden'} (${vouchers?.meta.total})`}</div>
            </div>

            {vouchers?.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {fund.type == 'budget' && <th>{translate('vouchers.labels.amount')}</th>}
                                        <th>{translate('vouchers.labels.note')}</th>
                                        <th className="nowrap">{translate('vouchers.labels.created_date')}</th>

                                        {fund.state !== 'closed' && (
                                            <Fragment>
                                                <th className="nowrap">{translate('vouchers.labels.expire_date')}</th>
                                                <th className="nowrap">{translate('vouchers.labels.used')}</th>
                                            </Fragment>
                                        )}

                                        <th>{translate('vouchers.labels.assigned')}</th>
                                        <th className="nowrap text-right">{translate('vouchers.labels.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {vouchers.data.map((voucher) => (
                                        <tr key={voucher.id}>
                                            {fund.type == 'budget' && (
                                                <td>{currencyFormat(parseFloat(voucher.amount))}</td>
                                            )}

                                            <td>
                                                {voucher.note && (
                                                    <Tooltip
                                                        type={'primary'}
                                                        text={strLimit(voucher.note || '-', 128)}
                                                    />
                                                )}
                                            </td>

                                            <td>
                                                <strong className="text-primary">
                                                    {voucher.created_at_locale.split(' - ')[0]}
                                                </strong>
                                                <br />
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {voucher.created_at_locale.split(' - ')[1]}
                                                </strong>
                                            </td>

                                            {fund.state !== 'closed' && (
                                                <td>
                                                    <strong className="text-strong text-md text-muted-dark">
                                                        {voucher.expire_at_locale}
                                                    </strong>
                                                </td>
                                            )}

                                            {fund.state !== 'closed' && (
                                                <td>
                                                    <div className="td-boolean flex-vertical">
                                                        <div className="flex text-primary">
                                                            {voucher.in_use ? (
                                                                <Fragment>
                                                                    <em className="mdi mdi-check-circle" />
                                                                    <strong>{voucher.first_use_date_locale}</strong>
                                                                </Fragment>
                                                            ) : (
                                                                <Fragment>
                                                                    <em className="mdi mdi-close" />
                                                                    <strong>{translate('vouchers.labels.no')}</strong>
                                                                </Fragment>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            <td>
                                                {voucher.expired ? (
                                                    <div className="td-boolean">
                                                        <em className="mdi mdi-close" />
                                                        <span className="text-md text-muted-dark">Verlopen</span>
                                                    </div>
                                                ) : (
                                                    <div className="td-boolean">
                                                        {voucher.state === 'active' && (
                                                            <em className="mdi mdi-check-circle" />
                                                        )}

                                                        {(voucher.state === 'pending' ||
                                                            voucher.state === 'deactivated') && (
                                                            <em className="mdi mdi-close" />
                                                        )}

                                                        <span className="block text-md text-muted-dark">
                                                            {voucher.state_locale}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <div className="button-group flex-end">
                                                    <StateNavLink
                                                        name="vouchers-show"
                                                        params={{
                                                            organizationId: organization.id,
                                                            fundId: fund?.id,
                                                            id: voucher?.id,
                                                        }}
                                                        className="button button-primary button-icon pull-right">
                                                        <em className="mdi mdi-eye-outline icon-start" />
                                                    </StateNavLink>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {vouchers?.meta?.total == 0 && <EmptyCard title={'Geen tegoeden gevonden'} type={'card-section'} />}

            {vouchers?.meta && (
                <div className="card-section" hidden={vouchers?.meta?.last_page < 2}>
                    <Paginator meta={vouchers.meta} filters={filter?.activeValues} updateFilters={filter.update} />
                </div>
            )}
        </div>
    );
}
