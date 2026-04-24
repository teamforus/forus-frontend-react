import { useCallback, useMemo } from 'react';
import FundRequest, { FundRequestMissedRecord } from '../props/models/FundRequest';
import { groupBy } from 'lodash';
import useTranslate from './useTranslate';

export default function useFundRequestMissedRecords(fundRequest: FundRequest) {
    const translate = useTranslate();

    const hasWarningMissedRecords = useMemo(() => {
        return (
            !fundRequest?.missing_records_approved &&
            !!fundRequest?.missed_records.filter((record) => record.type === 'warning').length
        );
    }, [fundRequest]);

    const infoMissedRecords = useMemo(() => {
        return groupBy(fundRequest?.missed_records.filter((record) => record.type === 'info') || [], 'group');
    }, [fundRequest]);

    const warningMissedRecords = useMemo(() => {
        return groupBy(fundRequest?.missed_records.filter((record) => record.type === 'warning') || [], 'group');
    }, [fundRequest]);

    const filterAndSortChildren = useCallback((list: { [_key: number]: Array<FundRequestMissedRecord> }) => {
        const keys = Object.keys(list).filter((key) => key.startsWith('child_'));

        const recordsByChildNumber: { [key: string]: Array<FundRequestMissedRecord> } = keys.reduce((carry, key) => {
            return {
                ...carry,
                [Number(key.split('_')[1])]: list[key],
            };
        }, {});

        return Object.fromEntries(Object.entries(recordsByChildNumber).sort(([a], [b]) => Number(a) - Number(b)));
    }, []);

    const infoMissedRecordsPerChild = useMemo((): { [_key: number]: Array<FundRequestMissedRecord> } => {
        return filterAndSortChildren(infoMissedRecords);
    }, [filterAndSortChildren, infoMissedRecords]);

    const warningMissedRecordsPerChild = useMemo((): { [_key: number]: Array<FundRequestMissedRecord> } => {
        return filterAndSortChildren(warningMissedRecords);
    }, [filterAndSortChildren, warningMissedRecords]);

    const missedRecordsText = useMemo(() => {
        const buildSection = (
            title: string,
            description: string,
            records: { [_key: string]: Array<FundRequestMissedRecord> },
            recordsPerChild: { [_key: number]: Array<FundRequestMissedRecord> },
            transKey: string,
        ) => {
            if (!Object.keys(records).length && !Object.keys(recordsPerChild).length) {
                return '';
            }

            let text = `${title}\n${description}\n`;

            // Person
            if (records.person?.length) {
                text += translate(`validation_requests.missed_records.labels.${transKey}.person`) + `: `;
                text += `${records.person
                    .map((record) => translate(`validation_requests.missed_records.person.${record.field}`))
                    .join(', ')}\n`;
            }

            // Family group
            if (records.partner?.length || records.children?.length || Object.keys(recordsPerChild).length) {
                text += translate(`validation_requests.missed_records.labels.${transKey}.family`) + `:\n`;

                if (records.partner?.length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.partner`)}: `;
                    text += `${records.partner
                        .map((record) => translate(`validation_requests.missed_records.partner.${record.field}`))
                        .join(', ')}\n`;
                }

                if (records.children?.length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.children_count`)}: `;
                    text += `${records.children
                        .map((record) => translate(`validation_requests.missed_records.children.${record.field}`))
                        .join(', ')}\n`;
                }

                if (Object.keys(recordsPerChild).length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.children`)}: `;
                    text += Object.keys(recordsPerChild)
                        .map(
                            (i) =>
                                `${recordsPerChild[i]
                                    .map((record: FundRequestMissedRecord) =>
                                        translate(`validation_requests.missed_records.child.${record.field}`, {
                                            number: i,
                                        }),
                                    )
                                    .join(', ')}`,
                        )
                        .join(', ');
                }

                text += `\n\n`;
            }

            return text;
        };

        const warningText = buildSection(
            translate('validation_requests.missed_records.labels.warning.title'),
            translate('validation_requests.missed_records.labels.warning.description'),
            warningMissedRecords,
            warningMissedRecordsPerChild,
            'warning',
        );

        const infoText = buildSection(
            translate('validation_requests.missed_records.labels.info.title'),
            translate('validation_requests.missed_records.labels.info.description'),
            infoMissedRecords,
            infoMissedRecordsPerChild,
            'info',
        );

        return [warningText, infoText].filter(Boolean).join('\n');
    }, [warningMissedRecords, warningMissedRecordsPerChild, infoMissedRecords, infoMissedRecordsPerChild, translate]);

    return {
        hasWarningMissedRecords,
        infoMissedRecords,
        warningMissedRecords,
        infoMissedRecordsPerChild,
        warningMissedRecordsPerChild,
        missedRecordsText,
    };
}
