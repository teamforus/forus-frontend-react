import React, { useCallback } from 'react';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import usePushDanger from '../../../../hooks/usePushDanger';
import { useFundService } from '../../../../services/FundService';
import FundProvider from '../../../../props/models/FundProvider';
import useStopActionConfirmation from './useStopActionConfirmation';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import ModalNotification from '../../../modals/ModalNotification';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useOrganizationService } from '../../../../services/OrganizationService';
import useTranslate from '../../../../hooks/useTranslate';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';

export default function useUpdateProduct() {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const fundService = useFundService();
    const stopActionConfirmation = useStopActionConfirmation();

    const organizationService = useOrganizationService();

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
                        pushDanger('Mislukt!', err.data.message);
                        reject();
                    });
            });
        },
        [fundService, pushDanger, pushSuccess],
    );

    const disableProduct = useCallback(
        (fundProvider: FundProvider, product: SponsorProduct): Promise<FundProvider> => {
            return new Promise<FundProvider>((resolve) => {
                stopActionConfirmation()
                    .then(() =>
                        updateProduct(fundProvider, {
                            enable_products: [],
                            disable_products: [product.id],
                        }).then((res: FundProvider) => resolve(res)),
                    )
                    .catch((err) => err);
            });
        },
        [stopActionConfirmation, updateProduct],
    );

    const deleteProduct = useCallback(
        (organization: Organization, fundProvider: FundProvider, product: SponsorProduct) => {
            return new Promise<boolean>((resolve) => {
                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        title="Weet u zeker dat u het aanbod wilt verwijderen?"
                        description={`U staat op het punt om ${product.name} te verwijderen. Weet u zeker dat u dit aanbod wilt verwijderen?`}
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

    return {
        updateProduct,
        deleteProduct,
        disableProduct,
    };
}
