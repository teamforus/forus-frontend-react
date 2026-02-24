import React from 'react';
import ExtraPaymentRefund from '../../../../props/models/ExtraPaymentRefund';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/label/Label';
import useProductReservationService from '../../../../services/ProductReservationService';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function ReservationExtraPaymentRefundsCard({ refunds }: { refunds: Array<ExtraPaymentRefund> }) {
    const translate = useTranslate();

    const productReservationService = useProductReservationService();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <span>{translate('reservation.header.refunds.title')}</span>
                    &nbsp;
                    <span className="span-count">{refunds.length}</span>
                </div>
            </div>

            <LoaderTableCard
                empty={refunds.length === 0}
                emptyTitle={'Geen restituties'}
                columns={productReservationService.getExtraPaymentRefundsColumns()}>
                {refunds?.map((refund) => (
                    <tr key={refund.id}>
                        <td>
                            <strong className="text-strong text-md text-muted-dark">{refund.created_at_locale}</strong>
                        </td>
                        <td>{refund.amount_locale}</td>
                        <td>
                            {refund.state == 'refunded' && <Label type="success">{refund.state_locale}</Label>}

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
            </LoaderTableCard>
        </div>
    );
}
