import React from 'react';
import ExtraPaymentRefund from '../../../../props/models/ExtraPaymentRefund';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/image_cropper/Label';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import useProductReservationService from '../../../../services/ProductReservationService';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../../elements/tables/TableTopScroller';

export default function ReservationExtraPaymentRefundsCard({ refunds }: { refunds: Array<ExtraPaymentRefund> }) {
    const translate = useTranslate();

    const productReservationService = useProductReservationService();

    const { headElement, configsElement } = useConfigurableTable(
        productReservationService.getExtraPaymentRefundsColumns(),
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <span>{translate('reservation.header.refunds.title')}</span>
                    &nbsp;
                    <span className="span-count">{refunds.length}</span>
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table form">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {refunds?.map((refund) => (
                                    <tr key={refund.id}>
                                        <td>
                                            <strong className="text-strong text-md text-muted-dark">
                                                {refund.created_at_locale}
                                            </strong>
                                        </td>
                                        <td>{refund.amount_locale}</td>
                                        <td>
                                            {refund.state == 'refunded' && (
                                                <Label type="success">{refund.state_locale}</Label>
                                            )}

                                            {['canceled', 'failed'].includes(refund.state) && (
                                                <Label type="danger">{refund.state_locale}</Label>
                                            )}

                                            {!['refunded', 'canceled', 'failed'].includes(refund.state) && (
                                                <Label type="warning">{refund.state_locale}</Label>
                                            )}
                                        </td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableEmptyValue />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>
        </div>
    );
}
