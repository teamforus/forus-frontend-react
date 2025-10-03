import React, { useMemo } from 'react';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';
import { hasPermission } from '../../../../helpers/utils';
import Organization, { Permission } from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import FundFormConfigsCard from './tabs-details-card/FundFormConfigsCard';
import FundFormCriteriaCard from './tabs-details-card/FundFormCriteriaCard';
import RecordType from '../../../../props/models/RecordType';
import FundFormPhysicalCardsCard from './tabs-details-card/FundFormPhysicalCardsCard';

export default function FundFormViewDetailsCard({
    fund,
    setFund,
    recordTypes,
    organization,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
    recordTypes: Array<RecordType>;
    organization: Organization;
}) {
    const canManagePhysicalCards = useMemo(() => {
        return (
            hasPermission(organization, Permission.MANAGE_FUNDS) &&
            organization.allow_physical_cards &&
            fund.allow_physical_cards
        );
    }, [organization, fund?.allow_physical_cards]);

    const tabs = useMemo(() => {
        return ['criteria', 'configs', canManagePhysicalCards ? 'physical_cards' : null].filter((tab) => tab);
    }, [canManagePhysicalCards]);

    const [viewType, setViewType] = useQueryParam(
        'view',
        withDefault(createEnumParam(tabs.map((tab) => tab)), 'criteria'),
        { removeDefaultsFromUrl: true },
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow">
                    {viewType === 'criteria' && <div className="card-title">Voorwaarden bewerken</div>}
                    {viewType === 'configs' && <div className="card-title">Instellingen aanvraagformulier</div>}
                    {viewType === 'physical_cards' && <div className="card-title">Fysieke passen</div>}
                </div>

                <div className="card-header-filters">
                    <BlockLabelTabs
                        value={viewType}
                        setValue={setViewType}
                        tabs={[
                            { value: 'criteria', label: 'Voorwaarden bewerken' },
                            { value: 'configs', label: 'Instellingen aanvraagformulier' },
                            { value: 'physical_cards', label: 'Fysieke passen' },
                        ].filter((tab) => tabs.includes(tab.value))}
                    />
                </div>
            </div>

            {viewType == 'criteria' && <FundFormCriteriaCard fund={fund} setFund={setFund} recordTypes={recordTypes} />}
            {viewType == 'configs' && <FundFormConfigsCard fund={fund} setFund={setFund} />}
            {viewType == 'physical_cards' && <FundFormPhysicalCardsCard fund={fund} setFund={setFund} />}
        </div>
    );
}
