import React, { Fragment } from 'react';
import { FundRequestMissedRecord } from '../../../../props/models/FundRequest';
import useTranslate from '../../../../hooks/useTranslate';

export default function FundRequestMissedRecordSection({
    type,
    records,
    recordsPerChild,
}: {
    type: 'warning' | 'info';
    records: { [_key: string]: Array<FundRequestMissedRecord> };
    recordsPerChild: { [_key: number]: Array<FundRequestMissedRecord> };
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            <p className="text-strong">{translate(`validation_requests.missed_records.labels.${type}.title`)}</p>
            <p>{translate(`validation_requests.missed_records.labels.${type}.description`)}</p>
            <ul>
                {records.person?.length > 0 && (
                    <li>
                        <span className="text-semibold">
                            {translate(`validation_requests.missed_records.labels.${type}.person`)}:{' '}
                        </span>
                        {records.person
                            .map((record) => translate(`validation_requests.missed_records.person.${record.field}`))
                            .join(', ')}
                    </li>
                )}

                {(records.partner?.length > 0 ||
                    records.children?.length > 0 ||
                    Object.keys(recordsPerChild).length > 0) && (
                    <li>
                        <span className="text-semibold">
                            {translate(`validation_requests.missed_records.labels.${type}.family`)}:{' '}
                        </span>
                        <ul>
                            {records.partner?.length > 0 && (
                                <li>
                                    <span>
                                        {translate(`validation_requests.missed_records.labels.${type}.partner`)}:{' '}
                                    </span>
                                    {records.partner
                                        .map((record) =>
                                            translate(`validation_requests.missed_records.partner.${record.field}`),
                                        )
                                        .join(', ')}
                                </li>
                            )}
                            {records.children?.length > 0 && (
                                <li>
                                    <span>
                                        {translate(`validation_requests.missed_records.labels.${type}.children_count`)}
                                        :{' '}
                                    </span>
                                    {records.children
                                        .map((record) =>
                                            translate(`validation_requests.missed_records.children.${record.field}`),
                                        )
                                        .join(', ')}
                                </li>
                            )}
                            {Object.keys(recordsPerChild).length > 0 && (
                                <li>
                                    <span>
                                        {translate(`validation_requests.missed_records.labels.${type}.children`)}:{' '}
                                    </span>
                                    {Object.keys(recordsPerChild)
                                        .map((i) =>
                                            recordsPerChild[i]
                                                .map((record: FundRequestMissedRecord) =>
                                                    translate(
                                                        `validation_requests.missed_records.child.${record.field}`,
                                                        { number: i },
                                                    ),
                                                )
                                                .join(', '),
                                        )
                                        .join(', ')}
                                </li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
        </Fragment>
    );
}
