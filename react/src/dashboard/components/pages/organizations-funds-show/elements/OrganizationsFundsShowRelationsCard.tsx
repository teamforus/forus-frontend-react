import React, { Fragment, useMemo } from 'react';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import OrganizationsFundsShowTopUpsCard from './OrganizationsFundsShowTopUpsCard';
import OrganizationsFundsShowImplementationsCard from './OrganizationsFundsShowImplementationsCard';
import OrganizationsFundsShowIdentitiesCard from './OrganizationsFundsShowIdentitiesCard';
import { filter } from 'lodash';

type TabType = 'top_ups' | 'identities' | 'implementations';

export default function OrganizationsFundsShowRelationsCard({
    fund,
    organization,
}: {
    fund: Fund;
    organization: Organization;
}) {
    const canViewFinances = useMemo(() => {
        return hasPermission(organization, 'view_finances');
    }, [organization]);

    const canViewIdentities = useMemo(() => {
        return hasPermission(organization, ['manage_implementation_notifications', 'manage_vouchers']);
    }, [organization]);

    const canViewImplementation = useMemo(() => {
        return hasPermission(organization, 'manage_implementation');
    }, [organization]);

    const availableViewTables = useMemo(() => {
        return filter<TabType>([
            canViewFinances ? 'top_ups' : null,
            canViewIdentities ? 'identities' : null,
            canViewImplementation ? 'implementations' : null,
        ]);
    }, [canViewImplementation, canViewFinances, canViewIdentities]);

    const defaultViewTable = useMemo<TabType>(() => {
        if (fund?.is_configured && availableViewTables.includes('top_ups')) {
            return 'top_ups';
        }

        if (availableViewTables.includes('implementations')) {
            return 'implementations';
        }

        return availableViewTables.includes('identities') ? 'identities' : null;
    }, [availableViewTables, fund?.is_configured]);

    const [viewTable, setViewTable] = useQueryParam(
        'table_view',
        withDefault(createEnumParam(availableViewTables), defaultViewTable),
        { removeDefaultsFromUrl: true },
    );

    const viewTypes = useMemo(() => {
        return filter<{ key: TabType; name: string }>([
            fund?.is_configured && canViewFinances ? { key: 'top_ups', name: 'Bekijk aanvullingen' } : null,
            canViewImplementation ? { key: 'implementations', name: 'Webshop' } : null,
            canViewIdentities ? { key: 'identities', name: 'Aanvragers' } : null,
        ]);
    }, [canViewImplementation, canViewFinances, canViewIdentities, fund?.is_configured]);

    return (
        <Fragment>
            {viewTable === 'top_ups' && (
                <OrganizationsFundsShowTopUpsCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}

            {viewTable === 'implementations' && (
                <OrganizationsFundsShowImplementationsCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}

            {viewTable === 'identities' && (
                <OrganizationsFundsShowIdentitiesCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}
        </Fragment>
    );
}
