import EmptyCard from '../../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';
import React from 'react';
import { hasPermission } from '../../../../helpers/utils';
import Organization, { Permission } from '../../../../props/models/Organization';

export default function VouchersTableNoFundsBlock({ organization }: { organization: Organization }) {
    return hasPermission(organization, Permission.MANAGE_FUNDS) ? (
        <EmptyCard
            description={'Je hebt momenteel geen fondsen.'}
            button={{
                text: 'Fonds toevoegen',
                to: getStateRouteUrl('organization-funds', { organizationId: organization.id }),
            }}
        />
    ) : (
        <EmptyCard description={'Je hebt momenteel geen fondsen.'} />
    );
}
