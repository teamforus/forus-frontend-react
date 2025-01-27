import React from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';
import useAppConfigs from '../../../hooks/useAppConfigs';

export default function LayoutAsideValidator({ organization }: { organization: Organization }) {
    const appConfigs = useAppConfigs();

    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>
            <LayoutAsideNavItem
                name={'Aanvragen'}
                icon={'clock'}
                route={'fund-requests'}
                routeParams={{ organizationId: organization?.id }}
                show={
                    appConfigs &&
                    appConfigs?.organizations?.funds?.fund_requests &&
                    hasPermission(organization, ['validate_records', 'manage_validators'], false)
                }
                id={'fund_requests'}
            />
            <LayoutAsideNavItem
                name={'Medewerkers'}
                icon={'list'}
                route={'employees'}
                routeParams={{ organizationId: organization?.id }}
                show={hasPermission(organization, 'manage_employees')}
                id={'employees'}
                dusk={'employeesPage'}
            />
            <LayoutAsideNavItem
                name={'Aanvragers'}
                icon={'file_csv'}
                route={'csv-validation'}
                routeParams={{ organizationId: organization?.id }}
                show={true}
                id={'requesters'}
            />
            <LayoutAsideNavItem
                name={'Beveiliging'}
                icon={'organization-security'}
                route={'organization-security'}
                routeParams={{ organizationId: organization?.id }}
                show={organization.allow_2fa_restrictions && hasPermission(organization, 'manage_organization')}
                id={'requesters'}
            />
        </div>
    );
}
