import React from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';
import useAppConfigs from '../../../hooks/useAppConfigs';

export default function LayoutAsideValidator({ activeOrganization }: { activeOrganization: Organization }) {
    const appConfigs = useAppConfigs();

    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>
            <LayoutAsideNavItem
                name={'Aanvragen'}
                icon={'clock'}
                route={'fund-requests'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={appConfigs && appConfigs?.organizations?.funds?.fund_requests}
                id={'fund_requests'}
            />
            <LayoutAsideNavItem
                name={'Fondsen'}
                icon={'fund_validations'}
                route={'external-funds'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_organization')}
                id={'external_funds'}
            />
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
