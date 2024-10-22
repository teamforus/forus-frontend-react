import React, { useCallback, useState } from 'react';
import useSetProgress from '../../../../hooks/useSetProgress';
import Fund from '../../../../props/models/Fund';
import { ResponseError } from '../../../../props/ApiResponses';
import usePushDanger from '../../../../hooks/usePushDanger';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import FundCriteriaEditor from '../../../elements/fund-criteria-editor/FundCriteriaEditor';
import RecordType from '../../../../props/models/RecordType';
import FundCriterion from '../../../../props/models/FundCriterion';
import classNames from 'classnames';

export default function OrganizationsFundsShowFundRequestCriteriaCard({
    fund,
    setFund,
    recordTypes,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
    recordTypes: Array<RecordType>;
}) {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const fundService = useFundService();

    const [collapsed, setCollapsed] = useState(true);

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterion>) => {
            setProgress(0);

            fundService
                .updateCriteria(fund.organization_id, fund.id, criteria)
                .then((res) => {
                    fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger(err.data.message || 'Error!'))
                .finally(() => setProgress(100));
        },
        [fund, fundService, pushDanger, pushSuccess, setProgress],
    );

    return (
        <div className="block block-collapsable form">
            <div className="collapsable-header" onClick={() => setCollapsed(!collapsed)}>
                <em
                    className={classNames(
                        'collapsable-header-icon',
                        'mdi',
                        collapsed ? 'mdi-menu-right' : 'mdi-menu-down',
                    )}
                />

                <div className="collapsable-header-title">Voorwaarden bewerken</div>

                {!collapsed ? (
                    <div className="button button-default button-sm" onClick={() => setCollapsed(true)}>
                        <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                        Inklappen
                    </div>
                ) : (
                    <div className="button button-primary button-sm" onClick={() => setCollapsed(false)}>
                        <em className="mdi mdi-arrow-expand-vertical icon-start" />
                        Uitklappen
                    </div>
                )}
            </div>

            {!collapsed && (
                <FundCriteriaEditor
                    fund={fund}
                    organization={fund.organization}
                    criteria={fund.criteria}
                    isEditable={fund.criteria_editable}
                    recordTypes={recordTypes}
                    setCriteria={(criteria) => setFund({ ...fund, criteria })}
                    saveButton={true}
                    onSaveCriteria={saveCriteria}
                    className={'flex-gap-none'}
                    bodyClassName={'collapsable-body'}
                    footerClassName={'collapsable-footer'}
                />
            )}
        </div>
    );
}
