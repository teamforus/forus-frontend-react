import { SponsorProductHistoryItem } from '../../../../props/models/Sponsor/SponsorProduct';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import React, { Fragment, useMemo, useState } from 'react';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';
import InfoBox from '../../../elements/info-box/InfoBox';
import HtmlDiffBlock from '../../../elements/html-diff/HtmlDiffBlock';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import EmptyValue from '../../../elements/empty-value/EmptyValue';

export default function ProductMonitoredHistoryCardItem({
    item,
    historyView,
}: {
    item: SponsorProductHistoryItem;
    historyView: 'compare' | 'diff';
}) {
    const translate = useTranslate();

    const [shownHistory, setShownHistory] = useState<boolean>(false);

    const fields = useMemo(() => {
        return Object.keys(item?.fields || {}).sort() || [];
    }, [item?.fields]);

    const fieldsList = useMemo(
        () => fields.map((key) => translate(`sponsor_products.fields.${key}`)).join(', '),
        [fields, translate],
    );

    return (
        <Fragment>
            <tr className={'tr-clickable'} onClick={() => setShownHistory(!shownHistory)}>
                <td>
                    <TableEntityMain title={'Velden bijwerken'} subtitle={fieldsList} collapsed={!shownHistory} />
                </td>
                <td>
                    <TableDateTime value={item.created_at_locale} />
                </td>
                <td className={'table-td-actions text-right'}>
                    <TableEmptyValue />
                </td>
            </tr>

            {shownHistory && (
                <tr>
                    <td className={'td-paddless'} colSpan={3}>
                        <table className={'table table-fixed table-align-top'}>
                            <thead>
                                <tr>
                                    <th className={'th-narrow'}></th>
                                    <th style={{ width: '240px' }}>Veld</th>
                                    {historyView === 'compare' ? (
                                        <Fragment>
                                            <th>Oud</th>
                                            <th>Nieuw</th>
                                        </Fragment>
                                    ) : (
                                        <th>Wijziging</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {fields?.map((fieldKey) => (
                                    <tr key={fieldKey}>
                                        <td></td>
                                        <td>{translate(`sponsor_products.fields.${fieldKey}`)}</td>
                                        {historyView === 'compare' ? (
                                            <Fragment>
                                                <td>
                                                    {fieldKey === 'description' ? (
                                                        <Markdown content={item.fields[fieldKey].from} />
                                                    ) : (
                                                        item.fields[fieldKey].from || <EmptyValue />
                                                    )}
                                                </td>
                                                <td>
                                                    {fieldKey === 'description' ? (
                                                        <Markdown content={item.fields[fieldKey].to} />
                                                    ) : (
                                                        item.fields[fieldKey].to || <EmptyValue />
                                                    )}
                                                </td>
                                            </Fragment>
                                        ) : (
                                            <td>
                                                {fieldKey === 'description' ? (
                                                    <div className={'flex flex-vertical flex-gap'}>
                                                        {historyView === 'diff' && (
                                                            <InfoBox type={'warning'} iconColor={'warning'}>
                                                                <div>
                                                                    <strong>Let op</strong>
                                                                </div>
                                                                <div>
                                                                    Deze weergave laat zien wat er is veranderd: de oude
                                                                    tekst is rood en de nieuwe tekst is groen. Bepaalde
                                                                    wijzigingen, zoals veranderingen in links (URLs),
                                                                    worden in deze weergave niet getoond.
                                                                </div>
                                                            </InfoBox>
                                                        )}
                                                        <HtmlDiffBlock
                                                            htmlFrom={item.fields[fieldKey].from || ''}
                                                            htmlTo={item.fields[fieldKey].to || ''}
                                                        />
                                                    </div>
                                                ) : (
                                                    <HtmlDiffBlock
                                                        htmlFrom={item.fields[fieldKey].from || ''}
                                                        htmlTo={item.fields[fieldKey].to || ''}
                                                    />
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
