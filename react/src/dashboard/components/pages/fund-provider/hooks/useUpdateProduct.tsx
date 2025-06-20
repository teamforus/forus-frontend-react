import React, { useCallback } from 'react';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import { useFundService } from '../../../../services/FundService';
import FundProvider from '../../../../props/models/FundProvider';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import ModalNotification from '../../../modals/ModalNotification';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useOrganizationService } from '../../../../services/OrganizationService';
import useTranslate from '../../../../hooks/useTranslate';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import usePushApiError from '../../../../hooks/usePushApiError';
import ModalFundProviderProductConfig from '../../../modals/ModalFundProviderProductConfig';
import Fund from '../../../../props/models/Fund';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useSetProgress from '../../../../hooks/useSetProgress';

export default function useUpdateProduct() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const organizationService = useOrganizationService();

    const mapProduct = useCallback((fundProvider: FundProvider, product: SponsorProduct) => {
        const activeDeals = product.deals_history ? product.deals_history.filter((deal) => deal.active) : [];

        return {
            ...product,
            allowed: fundProvider.products.includes(product.id),
            active_deal: activeDeals.length > 0 ? activeDeals[0] : null,
        };
    }, []);

    const disableProductConfirmation = useCallback((): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title="De publicatie van het aanbod wordt van de website verwijderd"
                    description_text={[
                        'Hierna kan er van dit aanbod geen gebruik meer worden gemaakt.\n',
                        'De gebruikte tegoeden blijven bewaard.',
                        'Wanneer u de publicatie opnieuw start, worden de gebruikte tegoeden verrekend met het nieuwe ingestelde limiet.',
                    ]}
                    buttonCancel={{
                        text: 'Annuleer',
                        onClick: () => {
                            modal.close();
                            resolve(false);
                        },
                    }}
                    buttonSubmit={{
                        text: 'Stop publicatie',
                        onClick: () => {
                            modal.close();
                            resolve(true);
                        },
                    }}
                />
            ));
        });
    }, [openModal]);

    const deleteSponsorProductConfirmation = useCallback(
        (organization: Organization, fundProvider: FundProvider, product: SponsorProduct) => {
            return new Promise<boolean>((resolve) => {
                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        title="Weet u zeker dat u het aanbod wilt verwijderen?"
                        description={[
                            `U staat op het punt om ${product.name} te verwijderen. Weet u zeker dat u dit aanbod wilt verwijderen?`,
                        ]}
                        buttonCancel={{
                            text: translate('modal.buttons.cancel'),
                            onClick: () => modal.close(),
                        }}
                        buttonSubmit={{
                            text: translate('modal.buttons.confirm'),
                            onClick: () => {
                                modal.close();
                                organizationService
                                    .sponsorProductDelete(organization.id, fundProvider.organization_id, product.id)
                                    .then(() => resolve(true));
                            },
                        }}
                    />
                ));
            });
        },
        [openModal, organizationService, translate],
    );

    const updateProduct = useCallback(
        (
            fundProvider: FundProvider,
            data: { enable_products?: Array<{ id?: number }>; disable_products?: Array<number> },
        ) => {
            return new Promise<FundProvider>((resolve, reject) => {
                fundService
                    .updateProvider(fundProvider.fund.organization_id, fundProvider.fund.id, fundProvider.id, data)
                    .then((res: ApiResponseSingle<FundProvider>) => {
                        pushSuccess('Opgeslagen!');
                        resolve(res.data.data);
                    })
                    .catch((err: ResponseError) => {
                        pushApiError(err);
                        reject();
                    });
            });
        },
        [fundService, pushApiError, pushSuccess],
    );

    const disableProduct = useCallback(
        (fundProvider: FundProvider, product: SponsorProduct): Promise<FundProvider> => {
            return new Promise<FundProvider>((resolve) => {
                disableProductConfirmation().then((conformed) => {
                    if (!conformed) {
                        return resolve(fundProvider);
                    }

                    updateProduct(fundProvider, {
                        enable_products: [],
                        disable_products: [product.id],
                    }).then((res: FundProvider) => resolve(res));
                });
            });
        },
        [disableProductConfirmation, updateProduct],
    );

    const deleteSponsorProduct = useCallback(
        (organization: Organization, fundProvider: FundProvider, product: SponsorProduct) => {
            return new Promise<boolean>((resolve) => {
                deleteSponsorProductConfirmation(organization, fundProvider, product).then((confirmed) => {
                    if (!confirmed) {
                        return resolve(false);
                    }

                    organizationService
                        .sponsorProductDelete(organization.id, fundProvider.organization_id, product.id)
                        .then(() => resolve(true));
                });
            });
        },
        [deleteSponsorProductConfirmation, organizationService],
    );

    const isProductConfigurable = useCallback((fund: Fund) => {
        return fund?.show_subsidies || fund?.show_qr_limits || fund?.show_requester_limits;
    }, []);

    const editProduct = useCallback(
        (fund: Fund, fundProvider: FundProvider, product: SponsorProduct) => {
            return new Promise<FundProvider>((resolve) => {
                if (!isProductConfigurable(fund)) {
                    fundService
                        .updateProvider(fund.organization_id, fund.id, fundProvider.id, {
                            enable_products: [{ id: product?.id, payment_type: 'budget' }],
                        })
                        .then((res) => {
                            resolve(res.data.data);
                            pushSuccess('Gelukt!', 'Product geaccepteerd.');
                        })
                        .catch((err: ResponseError) => pushApiError(err))
                        .finally(() => setProgress(100));
                } else {
                    openModal((modal) => (
                        <ModalFundProviderProductConfig
                            fundProvider={fundProvider}
                            product={product}
                            fund={fund}
                            modal={modal}
                            onUpdate={(fundProvider) => resolve(fundProvider)}
                        />
                    ));
                }
            });
        },
        [fundService, openModal, pushApiError, pushSuccess, setProgress, isProductConfigurable],
    );

    return {
        mapProduct,
        editProduct,
        updateProduct,
        disableProduct,
        deleteSponsorProduct,
        isProductConfigurable,
    };
}
