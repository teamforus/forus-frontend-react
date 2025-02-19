import React from 'react';
import Organization, { TranslationStats } from '../../../../props/models/Organization';
import { numberFormat } from '../../../../helpers/string';

export default function OrganizationsTranslationsStatsColumn({
    title,
    stats,
    organization,
}: {
    title: string;
    stats: TranslationStats;
    organization: Organization;
}) {
    return (
        <div className="col col-xs-12 col-sm-6 col-md-4">
            <h4 className={'text-strong'}>{title}</h4>
            <ul className={'text-medium'}>
                <li className="text-semibold">Gebruikte tekens: {numberFormat(parseInt(stats?.total?.symbols))}</li>
                <li>
                    <span className="text-semibold">Berekening:</span>{' '}
                    {numberFormat(parseInt(stats?.total?.symbols)) +
                        ' / ' +
                        numberFormat(organization?.translations_monthly_limit)}
                    <ul style={{ margin: '0 0' }}>
                        {Object.keys(stats?.count_per_type).map((key) => {
                            const type = stats?.count_per_type[key];
                            return (
                                <li key={key}>
                                    <span className="text-semibold">{key}:</span> {type.symbols.toLocaleString()} or ~{' '}
                                    {type.cost}
                                </li>
                            );
                        })}
                    </ul>
                </li>
                <li className="text-semibold">Schatting van de kosten: {stats?.total?.cost}</li>
            </ul>
        </div>
    );
}
