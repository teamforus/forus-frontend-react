import React, { Fragment } from 'react';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import InfoBox from '../../../elements/info-box/InfoBox';
import FundRequest from '../../../../props/models/FundRequest';
import useTranslate from '../../../../hooks/useTranslate';
import useFundRequestMissedRecords from '../../../../hooks/useFundRequestMissedRecords';
import FundRequestMissedRecordSection from './FundRequestMissedRecordSection';

export default function FundRequestMissedRecords({ fundRequest }: { fundRequest: FundRequest }) {
    const translate = useTranslate();

    const { infoMissedRecords, warningMissedRecords, warningMissedRecordsPerChild, infoMissedRecordsPerChild } =
        useFundRequestMissedRecords(fundRequest);

    return (
        <Fragment>
            {fundRequest?.missed_records.length > 0 && (
                <KeyValueItem label={translate('validation_requests.labels.warning')}>
                    <div className="flex flex-gap flex-vertical flex-grow">
                        {Object.keys(warningMissedRecords).length > 0 && (
                            <InfoBox type="danger" borderType="dashed" iconType="warning" iconColor="default">
                                <FundRequestMissedRecordSection
                                    type="warning"
                                    records={warningMissedRecords}
                                    recordsPerChild={warningMissedRecordsPerChild}
                                />
                            </InfoBox>
                        )}

                        {Object.keys(infoMissedRecords).length > 0 && (
                            <InfoBox type="primary" borderType="dashed">
                                <FundRequestMissedRecordSection
                                    type="info"
                                    records={infoMissedRecords}
                                    recordsPerChild={infoMissedRecordsPerChild}
                                />
                            </InfoBox>
                        )}
                    </div>
                </KeyValueItem>
            )}
        </Fragment>
    );
}
