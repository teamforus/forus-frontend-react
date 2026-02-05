import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { numberFormat } from '../../../../helpers/string';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import { useOrganizationService } from '../../../../services/OrganizationService';
import { TranslationStats } from '../../../../props/models/Organization';

export default function TranslationStatsTable({
    stats,
}: {
    stats: { data: TranslationStats; current_month: TranslationStats };
}) {
    const organizationService = useOrganizationService();

    const [shownKeys, setShownKeys] = useState([]);
    return (
        <LoaderTableCard
            empty={stats.data.groups.length === 0}
            emptyTitle={'Geen vertalingen'}
            columns={organizationService.getTranslationStatsColumns()}>
            {stats.data.groups.map((group, index) => (
                <Fragment key={index}>
                    <tr
                        className={'tr-clickable'}
                        onClick={(e) => {
                            e?.preventDefault();
                            e?.stopPropagation();

                            setShownKeys((keys) => {
                                return keys.includes(index) ? keys.filter((item) => item !== index) : [...keys, index];
                            });
                        }}>
                        <td>
                            <div className="td-collapsable">
                                <div className="collapsable-icon">
                                    <div
                                        className={classNames(
                                            `mdi icon-collapse `,
                                            shownKeys.includes(index) ? 'mdi-menu-down' : 'mdi-menu-right',
                                        )}
                                    />
                                </div>

                                <div className="collapsable-content text-semibold">{group.name}</div>
                            </div>
                        </td>
                        <td className={'text-semibold'}>
                            {group.symbols ? numberFormat(group.symbols) : <TableEmptyValue />}
                        </td>
                        <td className={'text-semibold'}>{group.costs}</td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                    {shownKeys.includes(index) &&
                        group?.locales?.map((locale) => (
                            <tr key={locale.name}>
                                <td>
                                    <div style={{ paddingLeft: '20px' }}>{locale.name}</div>
                                </td>
                                <td>{locale.symbols ? numberFormat(locale.symbols) : <TableEmptyValue />}</td>
                                <td>{locale.symbols ? locale.costs : <TableEmptyValue />}</td>
                                <td className={'table-td-actions text-right'}>
                                    <TableEmptyValue />
                                </td>
                            </tr>
                        ))}

                    {index === stats.data.groups?.length - 1 && (
                        <tr className={'tr-totals'}>
                            <td className={'text-strong'}>Totaal</td>
                            <td className={'text-strong'}>{numberFormat(stats?.data?.total?.symbols || 0)}</td>
                            <td className={'text-strong'}>{stats?.data?.total?.cost}</td>
                            <td className={'table-td-actions text-right'}>
                                <TableEmptyValue />
                            </td>
                        </tr>
                    )}
                </Fragment>
            ))}
        </LoaderTableCard>
    );
}
