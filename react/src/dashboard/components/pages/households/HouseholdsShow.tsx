import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import Card from '../../elements/card/Card';
import CardBlockKeyValue from '../../elements/card/blocks/CardBlockKeyValue';
import { hasPermission } from '../../../helpers/utils';
import { Permission } from '../../../props/models/Organization';
import Household from '../../../props/models/Sponsor/Household';
import useHouseholdsService from '../../../services/HouseholdsService';
import usePushApiError from '../../../hooks/usePushApiError';
import FormPane from '../../elements/forms/elements/FormPane';
import useEditHousehold from './hooks/useEditHousehold';
import HouseholdIdentitiesCard from './elements/HouseholdIdentitiesCard';

export default function HouseholdsShow() {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const householdsService = useHouseholdsService();

    const householdId = parseInt(useParams().id);
    const [household, setHousehold] = useState<Household>(null);

    const editHousehold = useEditHousehold(activeOrganization);

    const fetchHousehold = useCallback(() => {
        setProgress(0);

        householdsService
            .read(activeOrganization.id, householdId)
            .then((res) => setHousehold(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, householdId, setProgress, householdsService, pushApiError]);

    useEffect(() => {
        fetchHousehold();
    }, [fetchHousehold]);

    if (!household) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="households"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    Huishoudens
                </StateNavLink>

                <div className="breadcrumb-item active">#{household?.id}</div>
            </div>

            <Card
                title={'Household'}
                buttons={[
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => editHousehold(household, fetchHousehold, 'members'),
                    },
                ]}
                className={'form'}>
                <FormPane title={'Household'}>
                    <CardBlockKeyValue
                        size={'md'}
                        items={[
                            { label: 'Household ID', value: household?.uid },
                            { label: 'Number of Members', value: household.count_people },
                            { label: 'Number of Underaged children', value: household.count_minors },
                            { label: 'Number of Adults', value: household.count_adults },
                        ]}
                    />
                </FormPane>
            </Card>

            <Card
                title={'Adresgegevens'}
                buttons={[
                    hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && {
                        text: 'Bewerken',
                        icon: 'pencil-outline',
                        onClick: () => editHousehold(household, fetchHousehold, 'address'),
                    },
                ]}
                className={'form'}>
                <FormPane title={'Adresgegevens'}>
                    <CardBlockKeyValue
                        size={'md'}
                        items={[
                            { label: 'Woonplaats', value: household?.city },
                            { label: 'Straatnaam', value: household?.street },
                            { label: 'Huisnummer', value: household?.house_nr },
                            { label: 'Huisnummer toevoeging', value: household?.house_nr_addition },
                            { label: 'Postcode', value: household?.postal_code },
                            { label: 'Woonwijk', value: household?.neighborhood_name },
                            { label: 'Gemeentenaam', value: household?.municipality_name },
                        ]}
                    />
                </FormPane>
            </Card>

            <HouseholdIdentitiesCard household={household} />
        </Fragment>
    );
}
