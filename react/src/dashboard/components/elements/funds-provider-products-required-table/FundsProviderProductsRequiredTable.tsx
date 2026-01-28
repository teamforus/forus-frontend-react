import React, { useState } from 'react';
import classNames from 'classnames';
import Fund from '../../../props/models/Fund';
import { strLimit } from '../../../helpers/string';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import useConfigurableTable from '../../pages/vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../tables/TableTopScroller';
import useProviderFundService from '../../../services/ProviderFundService';

export default function FundsProviderProductsRequiredTable({
    collapsed = true,
    funds,
}: {
    collapsed?: boolean;
    funds: Fund[];
}) {
    const providerFundService = useProviderFundService();

    const { headElement, configsElement } = useConfigurableTable(providerFundService.getProductsRequiredColumns());

    const [showFunds, setShowFunds] = useState(!collapsed);

    return (
        <div className="card card-no-shadow card-bordered card-overflow-hidden">
            <div className="card-header card-header-md clickable" onClick={() => setShowFunds(!showFunds)}>
                <div className="card-title">
                    <div className={classNames('mdi', showFunds ? 'mdi-menu-down' : 'mdi-menu-right')} />
                    <div>Fondsen die vereisen dat u een aanbod plaatst ({funds.length})</div>
                </div>
            </div>

            {showFunds && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {funds.map((fund) => (
                                        <tr key={fund.id}>
                                            <td title={fund.name || '-'}>{strLimit(fund.name, 50)}</td>
                                            <td>{fund.external ? 'External' : 'Regular'}</td>
                                            <td>{fund.implementation?.name || <TableEmptyValue />}</td>
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
            )}
        </div>
    );
}
