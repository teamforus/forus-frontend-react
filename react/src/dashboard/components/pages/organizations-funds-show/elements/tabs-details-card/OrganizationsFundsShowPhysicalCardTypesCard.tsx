import React, { Fragment, useCallback } from 'react';
import Fund from '../../../../../props/models/Fund';
import FormPane from '../../../../elements/forms/elements/FormPane';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import KeyValueList from '../../../../elements/key-value/KeyValueList';
import useOpenModal from '../../../../../hooks/useOpenModal';
import ModalFundEditPhysicalCardSettings from '../../../../modals/ModalFundEditPhysicalCardSettings';
import Organization from '../../../../../props/models/Organization';
import PhysicalCardTypesTable from '../../../physical-cards/elements/PhysicalCardTypesTable';
import { useAssignPhysicalCardTypeToFund } from '../../hooks/useAssignPhysicalCardTypeToFund';
import classNames from 'classnames';
import { useRemovePhysicalCardTypeFromFund } from '../../hooks/useRemovePhysicalCardTypeFromFund';

export default function OrganizationsFundsShowPhysicalCardTypesCard({
    fund,
    setFund,
    organization,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
    organization: Organization;
}) {
    const openModal = useOpenModal();
    const assignPhysicalCardTypeToFund = useAssignPhysicalCardTypeToFund();
    const removePhysicalCardTypeFromFund = useRemovePhysicalCardTypeFromFund();

    const edit = useCallback(() => {
        openModal((modal) => <ModalFundEditPhysicalCardSettings modal={modal} fund={fund} setFund={setFund} />);
    }, [openModal, fund, setFund]);

    return (
        <Fragment>
            <div className="card-section form">
                <div className="flex flex-gap flex-vertical">
                    <FormPane title={'Physical cards settings'}>
                        <KeyValueList>
                            <KeyValueItem label={'Enable physical cards'}>
                                {fund.allow_physical_cards ? 'Ja' : 'Nee'}
                            </KeyValueItem>
                            {fund.allow_physical_cards && (
                                <Fragment>
                                    <KeyValueItem label={'Allow request physical cards'}>
                                        {fund.allow_physical_card_requests ? 'Ja' : 'Nee'}
                                    </KeyValueItem>
                                    <KeyValueItem label={'Allow link physical card'}>
                                        {fund.allow_physical_card_linking ? 'Ja' : 'Nee'}
                                    </KeyValueItem>
                                    <KeyValueItem label={'Allow deactivate physical physical card'}>
                                        {fund.allow_physical_card_deactivation ? 'Ja' : 'Nee'}
                                    </KeyValueItem>
                                    <KeyValueItem label={'Allow request on application'}>
                                        {fund.allow_physical_cards_on_application ? 'Ja' : 'Nee'}
                                    </KeyValueItem>
                                </Fragment>
                            )}
                        </KeyValueList>
                    </FormPane>

                    <button className="button button-default" onClick={edit}>
                        <em className="mdi mdi-cog-outline" />
                        Manage physical card settings
                    </button>
                </div>
            </div>

            {fund.allow_physical_cards && (
                <div className="card-section card-section-primary card-section-sm">
                    <PhysicalCardTypesTable
                        tab={'physical_card_types'}
                        tabs={[]}
                        funds={null}
                        setTab={() => null}
                        organization={organization}
                        filterUseQueryParams={false}
                        fundId={fund.id}
                        cardButtons={({ physicalCardTypes, fetchPhysicalCardTypes }) => (
                            <button
                                onClick={() =>
                                    assignPhysicalCardTypeToFund(
                                        fund,
                                        physicalCardTypes.data.map((type) => type.id),
                                        fetchPhysicalCardTypes,
                                    )
                                }
                                className="button button-primary button-sm">
                                <em className="mdi mdi-plus-circle icon-start" />
                                Assign card type
                            </button>
                        )}
                        actionButtons={({ fetchPhysicalCardTypes, physicalCardType, closeMenu }) => (
                            <div
                                className={classNames('dropdown-item')}
                                onClick={() => {
                                    closeMenu();
                                    removePhysicalCardTypeFromFund(fund, physicalCardType, fetchPhysicalCardTypes);
                                }}>
                                <em className="mdi mdi-close icon-start icon-start" />
                                Verwijderen
                            </div>
                        )}
                    />
                </div>
            )}
        </Fragment>
    );
}
