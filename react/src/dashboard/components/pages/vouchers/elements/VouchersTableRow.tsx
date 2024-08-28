import React, { Fragment, useCallback } from 'react';
import Voucher from '../../../../props/models/Voucher';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Organization from '../../../../props/models/Organization';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import VouchersTableRowStatus from './VouchersTableRowStatus';
import useTranslate from '../../../../hooks/useTranslate';
import Fund from '../../../../props/models/Fund';
import TableRowActions from '../../../elements/tables/TableRowActions';
import { hasPermission } from '../../../../helpers/utils';
import useShowVoucherQrCode from '../hooks/useShowVoucherQrCode';

export default function VouchersTableRow({
    funds,
    voucher,
    organization,
    fetchVouchers,
    shownVoucherMenuId,
    setShownVoucherMenuId,
}: {
    funds: Array<Partial<Fund>>;
    voucher: Voucher;
    organization: Organization;
    fetchVouchers: () => void;
    shownVoucherMenuId?: number;
    setShownVoucherMenuId?: React.Dispatch<React.SetStateAction<number>>;
}) {
    const translate = useTranslate();
    const showQrCode = useShowVoucherQrCode();

    const onOpenAction = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const fund = funds?.find((fund) => fund.id === voucher.fund_id);
            setShownVoucherMenuId(null);
            showQrCode(organization, voucher, fund, fetchVouchers);
        },
        [fetchVouchers, funds, organization, setShownVoucherMenuId, showQrCode, voucher],
    );

    return (
        <StateNavLink
            key={voucher.id}
            customElement={'tr'}
            className="tr-clickable"
            name={'vouchers-show'}
            params={{ id: voucher.id, organizationId: organization.id }}
            dataDusk={`voucherItem${voucher.id}`}>
            <td>{voucher.id}</td>
            <td>
                <div>
                    <strong className="text-primary">
                        {strLimit(voucher.identity_email, 32) || voucher.activation_code || 'Niet toegewezen'}
                    </strong>
                </div>

                <div className="text-strong text-md text-muted">
                    {(voucher.identity_bsn || voucher.relation_bsn) && (
                        <span>
                            BSN:&nbsp;
                            <span className="text-muted-dark">{voucher.identity_bsn || voucher.relation_bsn}</span>
                            &nbsp;
                        </span>
                    )}

                    {(voucher.client_uid ||
                        (!voucher.identity_email && voucher.activation_code) ||
                        (!voucher.identity_bsn && !voucher.relation_bsn && voucher.physical_card.code)) && (
                        <span>
                            NR:&nbsp;
                            <span className="text-muted-dark">
                                {voucher.client_uid || voucher.physical_card.code || 'Nee'}
                            </span>
                            &nbsp;
                        </span>
                    )}
                </div>
            </td>

            <td>
                <div className="text-md text-muted-dark text-medium">{voucher.source_locale}</div>
            </td>

            <td>
                <div className="text-md text-muted-dark text-medium">{voucher.product ? 'Product' : 'Budget'}</div>
            </td>

            {!voucher.product ? (
                <td>{currencyFormat(parseFloat(voucher.amount_total))}</td>
            ) : (
                <td>
                    <div className="text-primary text-medium" title={voucher.product.organization.name}>
                        {strLimit(voucher.product.organization.name, 32)}
                    </div>
                    <div className="text-strong text-md text-muted-dark" title={voucher.product.name}>
                        {strLimit(voucher.product.name, 32)}
                    </div>
                </td>
            )}

            <td>
                {voucher.note ? (
                    <Tooltip type={'primary'} text={strLimit(voucher.note || '-', 128)} />
                ) : (
                    <div className="text-muted">-</div>
                )}
            </td>

            <td>
                <div className="text-primary text-medium">{strLimit(voucher.fund.name, 32)}</div>

                <div className="text-strong text-md text-muted-dark">
                    {strLimit(voucher.fund.implementation?.name, 32)}
                </div>
            </td>

            <td>
                <div className="text-medium text-primary">{voucher.created_at_locale.split(' - ')[0]}</div>

                <div className="text-strong text-md text-muted-dark">{voucher.created_at_locale.split(' - ')[1]}</div>
            </td>

            <td>
                <div className="text-medium text-primary">{voucher.expire_at_locale.split(',')[0]}</div>

                <div className="text-strong text-md text-muted-dark">{voucher.expire_at_locale.split(',')[1]}</div>
            </td>

            <td>
                <div className="td-boolean flex-vertical">
                    <div className="text-primary">
                        {voucher.in_use ? (
                            <Fragment>
                                <em className="mdi mdi-check-circle" />
                                <div className="text-primary">{voucher.first_use_date_locale.split(',')[0]}</div>
                                <div className="text-strong text-md text-muted-dark">
                                    {voucher.first_use_date_locale.split(',')[1]}
                                </div>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <em className="mdi mdi-close" />
                                {translate('vouchers.labels.no')}
                            </Fragment>
                        )}
                    </div>
                </div>
            </td>

            <td>
                <div className="td-boolean flex-vertical">
                    <div className="text-primary">
                        {voucher.has_payouts ? (
                            <Fragment>
                                <em className="mdi mdi-check-circle" />
                                <div>{translate('vouchers.labels.yes')}</div>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <em className="mdi mdi-close" />
                                <div>{translate('vouchers.labels.no')}</div>
                            </Fragment>
                        )}
                    </div>
                </div>
            </td>

            <td>
                <VouchersTableRowStatus voucher={voucher} />
            </td>

            <td className={'table-td-actions'} style={{ zIndex: shownVoucherMenuId === voucher.id ? 1 : 0 }}>
                <div className={`actions ${shownVoucherMenuId == voucher.id ? 'active' : ''}`}>
                    <TableRowActions id={voucher.id} activeId={shownVoucherMenuId} setActiveId={setShownVoucherMenuId}>
                        <div className="dropdown dropdown-actions">
                            <StateNavLink
                                className="dropdown-item"
                                name={'vouchers-show'}
                                params={{ organizationId: organization.id, id: voucher.id }}>
                                <em className={'mdi mdi-eye icon-start'} />
                                Bekijken
                            </StateNavLink>

                            {hasPermission(organization, 'manage_vouchers') &&
                                !voucher.is_granted &&
                                !voucher.expired &&
                                voucher.state != 'deactivated' && (
                                    <Fragment>
                                        <a
                                            className={`dropdown-item ${voucher.state === 'active' ? 'disabled' : ''}`}
                                            onClick={onOpenAction}>
                                            <em className="mdi mdi-bookmark icon-start" />
                                            Activeren
                                        </a>

                                        <a
                                            className={`dropdown-item ${voucher.state === 'pending' ? 'disabled' : ''}`}
                                            onClick={onOpenAction}>
                                            <em className="mdi mdi-qrcode icon-start" />
                                            QR-code
                                        </a>
                                    </Fragment>
                                )}
                        </div>
                    </TableRowActions>
                </div>
            </td>
        </StateNavLink>
    );
}
