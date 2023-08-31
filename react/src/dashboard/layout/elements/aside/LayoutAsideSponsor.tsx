import React from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import { AppConfigProp } from '../../../services/ConfigService';
import Organization from '../../../props/models/Organization';

export default function LayoutAsideSponsor({ activeOrganization }: { activeOrganization: Organization }) {
    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>
            <LayoutAsideNavItem
                name={'Medewerkers'}
                icon={'list'}
                route={'employees'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_employees')}
                id={'employees'}
            />
            <LayoutAsideNavItem
                name={'Aanvragers'}
                icon={'file_csv'}
                route={'csv-validation'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={true}
                target={'_blank'}
                id={'requesters'}
            />
            <LayoutAsideNavItem
                name={'Beveiliging'}
                icon={'organization-security'}
                route={'organization-security'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={
                    activeOrganization.allow_2fa_restrictions &&
                    hasPermission(activeOrganization, 'manage_organization')
                }
                id={'requesters'}
            />
        </div>
    );
}
