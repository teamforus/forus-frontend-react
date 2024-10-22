import React, { useCallback, useEffect, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import OrganizationsFundsShowFundRequestConfigCard from './OrganizationsFundsShowFundRequestConfigCard';
import OrganizationsFundsShowFundRequestCriteriaCard from './OrganizationsFundsShowFundRequestCriteriaCard';
import RecordType from '../../../../props/models/RecordType';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useRecordTypeService } from '../../../../services/RecordTypeService';

export default function OrganizationsFundsShowCriteriaCard({
    fund,
    setFund,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const setProgress = useSetProgress();
    const recordTypeService = useRecordTypeService();

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list({ criteria: 1 })
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    return recordTypes ? (
        <div className="card-section card-section-primary">
            <div className="flex flex-vertical flex-gap">
                <OrganizationsFundsShowFundRequestCriteriaCard
                    fund={fund}
                    setFund={setFund}
                    recordTypes={recordTypes}
                />

                <OrganizationsFundsShowFundRequestConfigCard fund={fund} setFund={setFund} />
            </div>
        </div>
    ) : (
        <LoadingCard />
    );
}
