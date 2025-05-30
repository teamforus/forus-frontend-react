import OrganizationsFundsShowDescriptionCard from './tabs-details-card/OrganizationsFundsShowDescriptionCard';
import OrganizationsFundsShowFormulasCard from './tabs-details-card/OrganizationsFundsShowFormulasCard';
import OrganizationsFundsShowStatisticsCard from './tabs-details-card/OrganizationsFundsShowStatisticsCard';
import React, { useMemo } from 'react';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';
import useTranslate from '../../../../hooks/useTranslate';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import classNames from 'classnames';
import OrganizationsFundsShowConfigsCard from './tabs-details-card/OrganizationsFundsShowConfigsCard';

export default function OrganizationsFundsShowDetailsCard({
    fund,
    setFund,
    organization,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
    organization: Organization;
}) {
    const translate = useTranslate();

    const canManageFunds = useMemo(() => {
        return hasPermission(organization, 'manage_funds');
    }, [organization]);

    const canManagePayouts = useMemo(() => {
        return organization.allow_payouts && hasPermission(organization, 'manage_payouts');
    }, [organization]);

    const canViewFinances = useMemo(() => {
        return hasPermission(organization, 'view_finances');
    }, [organization]);

    const tabs = useMemo(() => {
        return [
            'description',
            canViewFinances ? 'statistics' : null,
            canManageFunds ? 'formulas' : null,
            canManagePayouts ? 'configs' : null,
        ].filter((tab) => tab);
    }, [canManageFunds, canManagePayouts, canViewFinances]);

    const [viewType, setViewType] = useQueryParam(
        'view',
        withDefault(createEnumParam(tabs.map((tab) => tab)), 'description'),
        { removeDefaultsFromUrl: true },
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow">
                    <div className="card-title">{translate(`funds_show.labels.base_card.header.${viewType}`)}</div>
                </div>

                <div className="card-header-filters">
                    <div className="block block-label-tabs">
                        <div className="label-tab-set">
                            {tabs?.map((tab) => (
                                <div
                                    key={tab}
                                    className={classNames('label-tab', 'label-tab-sm', tab == viewType && 'active')}
                                    onClick={() => setViewType(tab)}>
                                    {translate(`funds_show.labels.base_card.header.${tab}`)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {viewType == 'description' && <OrganizationsFundsShowDescriptionCard fund={fund} />}
            {viewType == 'statistics' && (
                <OrganizationsFundsShowStatisticsCard fund={fund} organization={organization} />
            )}
            {viewType == 'formulas' && <OrganizationsFundsShowFormulasCard fund={fund} />}
            {viewType == 'configs' && <OrganizationsFundsShowConfigsCard fund={fund} setFund={setFund} />}
        </div>
    );
}
