import React, { Fragment, useCallback } from 'react';
import Fund from '../../../../../props/models/Fund';
import FormPane from '../../../../elements/forms/elements/FormPane';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import KeyValueList from '../../../../elements/key-value/KeyValueList';
import useOpenModal from '../../../../../hooks/useOpenModal';
import ModalFundEditPhysicalCardSettings from '../../../../modals/ModalFundEditPhysicalCardSettings';
import Organization from '../../../../../props/models/Organization';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import FundPhysicalCardTypesTable from './tables/FundPhysicalCardTypesTable';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';

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

    const edit = useCallback(() => {
        openModal((modal) => <ModalFundEditPhysicalCardSettings modal={modal} fund={fund} setFund={setFund} />);
    }, [openModal, fund, setFund]);

    return (
        <Fragment>
            <div className="card-section form">
                <div className="flex flex-gap flex-vertical">
                    <FormPane title={'Fysieke pas instellingen'}>
                        <KeyValueList>
                            <KeyValueItem label={'Fysieke pas functionaliteit ingeschakeld'}>
                                {fund.allow_physical_cards ? 'Ja' : 'Nee'}
                            </KeyValueItem>
                        </KeyValueList>
                    </FormPane>

                    <div className="button-group">
                        <button className="button button-default" onClick={edit}>
                            <em className="mdi mdi-pencil-outline" />
                            Fysieke pas instellingen wijzigen
                        </button>
                        {fund.allow_physical_cards && (
                            <StateNavLink
                                className="button button-text"
                                name={DashboardRoutes.FUND_FORM}
                                params={{
                                    organizationId: fund.organization_id,
                                    id: fund.fund_form_id,
                                }}
                                query={{
                                    view: 'physical_cards',
                                }}>
                                Fysieke pas instellingen wijzigen voor de aanvraag van een fonds
                            </StateNavLink>
                        )}
                    </div>
                </div>
            </div>

            {fund.allow_physical_cards && (
                <div className="card-section card-section-primary card-section-sm">
                    <FundPhysicalCardTypesTable fund={fund} organization={organization} />
                </div>
            )}
        </Fragment>
    );
}
