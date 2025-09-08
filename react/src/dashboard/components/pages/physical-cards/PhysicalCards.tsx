import React, { useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import PhysicalCardsTable from './elements/PhysicalCardsTable';
import { BooleanParam, useQueryParam, withDefault } from 'use-query-params';
import PhysicalCardTypesTable from './elements/PhysicalCardTypesTable';
import useVoucherTableOptions from '../vouchers/hooks/useVoucherTableOptions';
import { useEditPhysicalCardType } from './hooks/useEditPhysicalCardType';

export default function PhysicalCards() {
    const activeOrganization = useActiveOrganization();

    const { funds } = useVoucherTableOptions(activeOrganization);
    const editPhysicalCardType = useEditPhysicalCardType();

    const [showTypes, setShowTypes] = useQueryParam('type', withDefault(BooleanParam, false), {
        removeDefaultsFromUrl: true,
    });

    const [tabs] = useState<Array<{ value: 'physical_cards' | 'physical_card_types'; label: string }>>([
        { value: 'physical_cards', label: `Fysieke passen` },
        { value: 'physical_card_types', label: `Passen types` },
    ]);

    if (!showTypes) {
        return (
            <PhysicalCardsTable
                organization={activeOrganization}
                tab={!showTypes ? 'physical_cards' : 'physical_card_types'}
                tabs={tabs}
                funds={funds}
                setTab={(type) => setShowTypes(type === 'physical_card_types')}
            />
        );
    }

    return (
        <PhysicalCardTypesTable
            organization={activeOrganization}
            tab={!showTypes ? 'physical_cards' : 'physical_card_types'}
            tabs={tabs}
            funds={funds}
            setTab={(type) => setShowTypes(type === 'physical_card_types')}
            cardButtons={({ fetchPhysicalCardTypes }) => (
                <button
                    onClick={() => editPhysicalCardType(activeOrganization, null, fetchPhysicalCardTypes)}
                    className="button button-primary button-sm">
                    <em className="mdi mdi-plus-circle icon-start" />
                    Aanmaken
                </button>
            )}
        />
    );
}
