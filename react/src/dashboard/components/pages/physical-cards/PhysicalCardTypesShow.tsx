import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import { usePhysicalCardTypeService } from '../../../services/PhysicalCardTypeService';
import PhysicalCardType from '../../../props/models/PhysicalCardType';
import useSetProgress from '../../../hooks/useSetProgress';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import PhysicalCardsTable from './elements/PhysicalCardsTable';
import useVoucherTableOptions from '../vouchers/hooks/useVoucherTableOptions';
import useAssetUrl from '../../../hooks/useAssetUrl';
import FormPane from '../../elements/forms/elements/FormPane';
import { useDeletePhysicalCardType } from './hooks/useDeletePhysicalCardType';
import { useNavigateState } from '../../../modules/state_router/Router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../helpers/string';
import { useEditPhysicalCardType } from './hooks/useEditPhysicalCardType';
import PhysicalCardTypeFundsTable from './elements/PhysicalCardTypeFundsTable';

export default function PhysicalCardTypesShow() {
    const { id } = useParams();

    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const editPhysicalCardType = useEditPhysicalCardType();
    const deletePhysicalCardType = useDeletePhysicalCardType();

    const activeOrganization = useActiveOrganization();
    const physicalCardTypeService = usePhysicalCardTypeService();

    const [physicalCardType, setPhysicalCardType] = useState<PhysicalCardType>(null);
    const { funds } = useVoucherTableOptions(activeOrganization);

    const fetchPhysicalCardType = useCallback(() => {
        setProgress(0);

        physicalCardTypeService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setPhysicalCardType(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, id, physicalCardTypeService, setProgress]);

    useEffect(() => {
        fetchPhysicalCardType();
    }, [fetchPhysicalCardType]);

    if (!physicalCardType) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'physical-cards'}
                    query={{ type: 1 }}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Passen types
                </StateNavLink>

                <div className="breadcrumb-item active">{strLimit(physicalCardType.name, 64)}</div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="card-section">
                        <div className="block block-product">
                            <div className="block-product-media">
                                <img
                                    src={
                                        physicalCardType.photo?.sizes?.large ||
                                        assetUrl('/assets/img/placeholders/physical-card-type.svg')
                                    }
                                    alt=""
                                />
                            </div>
                            <div className="block-product-content flex-grow form">
                                <div className="flex flex-vertical flex-gap-sm">
                                    <div className="block-product-details flex-grow">
                                        <div className="block-product-name">{physicalCardType?.name}</div>
                                    </div>
                                    <div className="block block-markdown block-product-description">
                                        {physicalCardType.description}
                                    </div>
                                </div>
                                <FormPane title={'Statistische gegevens'}>
                                    <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                                        <KeyValueItem label={'Total cards'}>
                                            {physicalCardType.physical_cards_count}
                                        </KeyValueItem>
                                        <KeyValueItem label={'Funds'}>{physicalCardType.funds_count}</KeyValueItem>
                                    </div>
                                </FormPane>
                            </div>
                        </div>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="button-group flex-end">
                            <button
                                onClick={() => {
                                    editPhysicalCardType(activeOrganization, physicalCardType, fetchPhysicalCardType);
                                }}
                                className="button button-default">
                                <em className="mdi mdi-pencil-outline" />
                                Bewerken
                            </button>
                            <button
                                className="button button-danger"
                                disabled={physicalCardType.in_use}
                                onClick={() => {
                                    deletePhysicalCardType(physicalCardType, () =>
                                        navigateState(
                                            'physical-cards',
                                            { organizationId: activeOrganization.id },
                                            { type: 1 },
                                        ),
                                    );
                                }}>
                                <em className="mdi mdi-trash-can-outline" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PhysicalCardsTable
                tab={'physical_cards'}
                tabs={[]}
                funds={funds}
                setTab={() => null}
                organization={activeOrganization}
            />

            <PhysicalCardTypeFundsTable physicalCardType={physicalCardType} />
        </Fragment>
    );
}
