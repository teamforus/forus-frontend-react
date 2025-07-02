import React, { useState } from 'react';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../hooks/useTranslate';
import { strLimit } from '../../../helpers/string';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';

export default function FundsProviderProductsRequiredTable({
    collapsed = true,
    funds,
}: {
    collapsed?: boolean;
    funds: Fund[];
}) {
    const translate = useTranslate();

    const [showFunds, setShowFunds] = useState(!collapsed);

    return (
        <div className="card card-no-shadow card-bordered card-overflow-hidden">
            <div className="card-header card-header-md clickable" onClick={() => setShowFunds(!showFunds)}>
                <div className="card-title">
                    <div className={`mdi ${showFunds ? 'mdi-menu-down' : 'mdi-menu-right'}`} />
                    <div>Fondsen die vereisen dat u een aanbod plaatst ({funds.length})</div>
                </div>
            </div>

            {showFunds && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{translate('components.organization_funds.labels.name')}</th>
                                        <th>{translate('components.organization_funds.labels.type')}</th>
                                        <th>{translate('components.organization_funds.labels.implementation')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {funds.map((fund) => (
                                        <tr key={fund.id}>
                                            <td title={fund.name || '-'}>{strLimit(fund.name, 50)}</td>
                                            <td>{fund.external ? 'External' : 'Regular'}</td>
                                            <td>{fund.implementation?.name || <TableEmptyValue />}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
