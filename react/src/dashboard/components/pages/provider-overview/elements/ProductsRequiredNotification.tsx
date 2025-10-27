import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import IconWarning from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/alert-icons/warning.svg';
import FundsProviderProductsRequiredTable from '../../../elements/funds-provider-products-required-table/FundsProviderProductsRequiredTable';
import useStorageService from '../../../../modules/storage/useStrorrageService';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useProviderFundService from '../../../../services/ProviderFundService';
import Fund from '../../../../props/models/Fund';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ProductsRequiredNotification({ organization }: { organization: Organization }) {
    const storage = useStorageService();
    const navigateState = useNavigateState();
    const providerFundService = useProviderFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);

    const goToProductCreate = useCallback(() => {
        storage.setCollectionWithExpiry('funds_provider_products_required', 1, 24 * 60);
        navigateState(DashboardRoutes.PRODUCT_CREATE, { organizationId: organization.id });
    }, [organization.id, storage, navigateState]);

    const fetchFunds = useCallback(() => {
        providerFundService.listFundsProviderProductsRequired(organization.id).then((res) => setFunds(res.data.data));
    }, [providerFundService, organization.id]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!funds || funds.length === 0) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-section">
                <div className="block block-info-with-icon form">
                    <div className="info-icon">
                        <IconWarning />
                    </div>

                    <div className="info-content">
                        <div className="info-content-title">Maak een aanbod aan om deel te nemen aan een fonds</div>
                        <div className="info-content-description">
                            Uw organisatie is aangemeld voor een fonds waarvoor een aanbod moet worden toegevoegd. Na
                            goedkeuring wordt uw aanbod zichtbaar op de website. Deze melding verdwijnt zodra u minimaal
                            één aanbod hebt toegevoegd.
                        </div>

                        <div className="info-content-actions">
                            <button type="button" className="button button-primary" onClick={goToProductCreate}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                Aanbod toevoegen
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section card-section-primary card-section-sm">
                <FundsProviderProductsRequiredTable funds={funds} />
            </div>
        </div>
    );
}
