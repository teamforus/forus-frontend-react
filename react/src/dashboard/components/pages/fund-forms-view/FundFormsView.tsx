import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundFormService } from '../../../services/FundFormService';
import FundForm from '../../../props/models/FundForm';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import FundFormCriteriaCard from './elements/FundFormCriteriaCard';
import FundFormConfigsCard from './elements/FundFormConfigsCard';
import { useParams } from 'react-router-dom';
import OrganizationFundsShowOverviewCard from '../organizations-funds-show/elements/OrganizationFundsShowOverviewCard';

export default function FundFormsView() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const fundFormService = useFundFormService();
    const recordTypeService = useRecordTypeService();

    const [fundForm, setFundForm] = useState<FundForm>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list({ criteria: 1 })
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const fetchFundForm = useCallback(() => {
        setProgress(0);

        fundFormService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setFundForm(res.data.data))
            .finally(() => setProgress(100));
    }, [id, activeOrganization.id, fundFormService, setProgress]);

    useEffect(() => {
        fetchFundForm();
    }, [fetchFundForm]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    if (!fundForm || !recordTypes) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <OrganizationFundsShowOverviewCard fund={fundForm.fund} compact={true} />

            <FundFormCriteriaCard
                fund={fundForm.fund}
                setFund={(fund) => {
                    setFundForm({ ...fundForm, fund: { ...fundForm.fund, ...fund } });
                    fetchFundForm();
                }}
                recordTypes={recordTypes}
            />

            <FundFormConfigsCard
                fund={fundForm.fund}
                setFund={(fund) => {
                    setFundForm({ ...fundForm, fund: { ...fundForm.fund, ...fund } });
                    fetchFundForm();
                }}
            />
        </Fragment>
    );
}
