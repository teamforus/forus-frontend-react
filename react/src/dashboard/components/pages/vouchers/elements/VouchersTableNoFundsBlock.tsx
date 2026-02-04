import EmptyCard from '../../../elements/empty-card/EmptyCard';
import React from 'react';
import { hasPermission } from '../../../../helpers/utils';
import Organization, { Permission } from '../../../../props/models/Organization';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function VouchersTableNoFundsBlock({ organization }: { organization: Organization }) {
    return hasPermission(organization, Permission.MANAGE_FUNDS) ? (
        <EmptyCard
            description={'Je hebt momenteel geen fondsen.'}
            button={{
                text: 'Fonds toevoegen',
                state: DashboardRoutes.ORGANIZATION_FUNDS,
                stateParams: { organizationId: organization.id },
            }}
        />
    ) : (
        <EmptyCard description={'Je hebt momenteel geen fondsen.'} />
    );
}
