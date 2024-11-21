import { SponsorProductHistoryItem } from '../../../../props/models/Sponsor/SponsorProduct';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import React, { Fragment, useMemo, useState } from 'react';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';
import InfoBox from '../../../elements/info-box/InfoBox';
import HtmlDiffBlock from '../../../elements/html-diff/HtmlDiffBlock';
import useTranslate from '../../../../hooks/useTranslate';

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
                <td className={'text-right'}>
                    <TableDateTime value={item.created_at_locale} />
                </td>
            </tr>

            {shownHistory && (
                <tr>
                    <td className={'td-paddless'} colSpan={2}>
                        <table className={'table table-fixed table-align-top'}>
                            <thead>
                                <tr>
                                    <th className={'th-narrow'}></th>
                                    <th style={{ width: '240px' }}>Field</th>
                                    {historyView === 'compare' ? (
                                        <Fragment>
                                            <th>From</th>
                                            <th>To</th>
                                        </Fragment>
                                    ) : (
                                        <th>Diff</th>
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
                                                        item.fields[fieldKey].from
                                                    )}
                                                </td>
                                                <td>
                                                    {fieldKey === 'description' ? (
                                                        <Markdown content={item.fields[fieldKey].to} />
                                                    ) : (
                                                        item.fields[fieldKey].to
                                                    )}
                                                </td>
                                            </Fragment>
                                        ) : (
                                            <td>
                                                {fieldKey === 'description' ? (
                                                    <div className={'flex flex-vertical flex-gap'}>
                                                        {historyView === 'diff' && (
                                                            <InfoBox
                                                                type={'warning'}
                                                                iconColor={'warning'}
                                                                iconPosition={'top'}>
                                                                <div>
                                                                    <strong>Caution!</strong>
                                                                </div>
                                                                <div>
                                                                    The diff view extracts text from the product
                                                                    description, which may not display certain changes,
                                                                    such as link URLs.
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
