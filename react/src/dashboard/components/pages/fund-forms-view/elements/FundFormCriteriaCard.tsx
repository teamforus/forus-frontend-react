import React, { useCallback } from 'react';
import useSetProgress from '../../../../hooks/useSetProgress';
import Fund from '../../../../props/models/Fund';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import FundCriteriaEditor from '../../../elements/fund-criteria-editor/FundCriteriaEditor';
import RecordType from '../../../../props/models/RecordType';
import FundCriterion from '../../../../props/models/FundCriterion';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function FundFormCriteriaCard({
    fund,
    setFund,
    recordTypes,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
    recordTypes: Array<RecordType>;
}) {
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterion>) => {
            setProgress(0);

            fundService
                .updateCriteria(fund.organization_id, fund.id, criteria)
                .then((res) => {
                    setFund({ ...fund, criteria: res.data.data.criteria });
                    pushSuccess('Opgeslagen!');
                })
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [fund, fundService, pushApiError, pushSuccess, setFund, setProgress],
    );

    return (
        <div className="card form">
            <div className="card-header">
                <div className="card-title">Voorwaarden bewerken</div>
            </div>

            <div className="card-section card-section-primary">
                <FundCriteriaEditor
                    fund={fund}
                    organization={fund.organization}
                    criteria={fund.criteria}
                    recordTypes={recordTypes}
                    setCriteria={(criteria) => setFund({ ...fund, criteria })}
                    onSaveCriteria={saveCriteria}
                    bodyClassName={'collapsable-body'}
                    footerClassName={'collapsable-footer'}
                />
            </div>
        </div>
    );
}
