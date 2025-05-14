import React from 'react';
import ExtraPaymentRefund from '../../../../props/models/ExtraPaymentRefund';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/image_cropper/Label';

export default function ReservationExtraPaymentRefunds({ refunds }: { refunds: Array<ExtraPaymentRefund> }) {
    const translate = useTranslate();

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
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <th>{translate('reservation.labels.refund_date')}</th>
                                    <th>{translate('reservation.labels.refund_amount')}</th>
                                    <th>{translate('reservation.labels.status')}</th>
                                </tr>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
