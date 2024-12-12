import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Organization from '../../props/models/Organization';
import FundProviderChat from '../../props/models/FundProviderChat';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import Fund from '../../props/models/Fund';
import FundProvider from '../../props/models/FundProvider';
import useFundProviderChatService from '../../services/FundProviderChatService';
import { ResponseError } from '../../props/ApiResponses';
import SponsorProduct from '../../props/models/Sponsor/SponsorProduct';

export default function ModalFundProviderChatMessage({
    modal,
    fund,
    product,
    className,
    organization,
    fundProvider,
    onSubmit,
}: {
    modal: ModalState;
    fund: Fund;
    product: SponsorProduct;
    className?: string;
    organization: Organization;
    fundProvider: FundProvider;
    onSubmit: (chat: FundProviderChat) => void;
}) {
    const fundProviderChatService = useFundProviderChatService();

    const form = useFormBuilder(
        {
            message: '',
            product_id: product.id,
        },
        (values) => {
            fundProviderChatService
                .store(organization.id, fund.id, fundProvider.id, values)
                .then((res) => {
                    onSubmit(res.data.data);
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);

                    if (err.status === 422) {
                        return form.setErrors(err.data.errors);
                    }

                    modal.close();
                });
        },
    );

    return (
        <div className={`modal modal-md modal-animated ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />

                <div className="modal-icon">
                    <div className="mdi mdi-message-text-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">Aanpassingsverzoek</div>
                            <div className="modal-text">
                                Is de aanbieding onvolledig of wilt u een aanpassing voorstellen? Stuur een
                                aanpassingsverzoek naar de aanbieder.
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="form-label form-label-required">Bericht</div>
                            <textarea
                                className="r-n form-control"
                                placeholder="Bericht aan aanbieder"
                                value={form.values.message}
                                onChange={(e) => form.update({ message: e.target.value })}
                            />
                            <FormError error={form.errors.message} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
