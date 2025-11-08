import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FundsProviderProductsRequiredTable from '../elements/funds-provider-products-required-table/FundsProviderProductsRequiredTable';
import useStorageService from '../../modules/storage/useStrorrageService';
import IconWarning from '../../../../assets/forus-platform/resources/_platform-common/assets/img/alert-icons/warning-outline.svg';
import { useNavigateState } from '../../modules/state_router/Router';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import Fund from '../../props/models/Fund';
import classNames from 'classnames';
import { DashboardRoutes } from '../../modules/state_router/RouterBuilder';

export default function ModalFundsProviderProductsRequired({ modal, funds }: { modal: ModalState; funds: Fund[] }) {
    const storage = useStorageService();
    const navigateState = useNavigateState();

    const activeOrganization = useActiveOrganization();

    const closeModal = useCallback(() => {
        storage.setCollectionWithExpiry('funds_provider_products_required', 1, 24 * 60);
        modal.close();
    }, [modal, storage]);

    const goToProductCreate = useCallback(() => {
        closeModal();
        navigateState(DashboardRoutes.PRODUCT_CREATE, { organizationId: activeOrganization.id });
    }, [activeOrganization.id, closeModal, navigateState]);

    return (
        <div
            className={classNames(
                `modal`,
                'modal-md',
                'modal-animated',
                'modal-provider-products-required',
                modal.loading && 'modal-loading',
            )}>
            <div className="modal-backdrop" />
            <div className="modal-window form">
                <div className="modal-body">
                    <div className="modal-section modal-section-sm">
                        <div className="block block-provider-products-required">
                            <div className="products-required-icon">
                                <IconWarning />
                            </div>

                            <div className="products-required-title">U heeft nog geen aanbod toegevoegd!</div>
                            <div className="products-required-description">
                                Uw organisatie is aangemeld voor een fonds waarvoor aanbod moet worden toegevoegd.
                                <br />
                                Na goedkeuring wordt uw aanbod zichtbaar op de website. Deze melding verdwijnt zodra u
                                minimaal één aanbod hebt toegevoegd.
                            </div>
                        </div>
                    </div>

                    <div className="modal-section modal-section-collapse modal-section-funds-list">
                        <FundsProviderProductsRequiredTable collapsed={false} funds={funds} />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={closeModal}>
                        <em className="mdi mdi-alarm-check icon-start" />
                        Toon morgen opnieuw
                    </button>

                    <button type="button" className="button button-primary" onClick={goToProductCreate}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        Aanbod toevoegen
                    </button>
                </div>
            </div>
        </div>
    );
}
