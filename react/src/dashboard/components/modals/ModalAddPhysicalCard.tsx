import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import Voucher from '../../props/models/Voucher';
import Organization from '../../props/models/Organization';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import FormError from '../elements/forms/errors/FormError';
import IconCardSuccess from '../../../../assets/forus-platform/resources/_platform-common/assets/img/modal/icon-physical-cards-success.svg';
import { usePhysicalCardService } from '../../services/PhysicalCardService';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import usePushApiError from '../../hooks/usePushApiError';

export default function ModalAddPhysicalCard({
    modal,
    voucher,
    className,
    onAttached,
    organization,
}: {
    modal: ModalState;
    voucher: Voucher;
    className?: string;
    onAttached: () => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const physicalCardService = usePhysicalCardService();

    const [code, setCode] = useState('');
    const [state, setState] = useState<'pending' | 'success'>('pending');

    const form = useFormBuilder({ code: '100' }, async (values) => {
        setProgress(0);

        physicalCardService
            .store(organization.id, voucher.id, values)
            .then((res) => {
                setProgress(100);
                setCode(res.data.data.code);
                setState('success');
                onAttached();
            })
            .catch((err: ResponseError) => {
                form.setIsLocked(false);
                pushApiError(err);

                if (err.status === 429) {
                    return form.setErrors({ code: [err.data.message] });
                }

                form.setErrors(err.data.errors);
            });
    });

    return (
        <div
            className={`modal modal-animated modal-physical-cards ${modal.loading ? 'modal-loading' : ''} ${
                className || ''
            }`}>
            <div className="modal-backdrop" aria-label="Sluiten" role="button" onClick={modal.close} />

            {state === 'pending' && (
                <form className="modal-window" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" aria-label="Sluiten" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">
                            {translate('modals.modal_voucher_physical_card.header.card_title')}
                        </div>
                    </div>

                    <div className="modal-content">
                        <div className="activation-card">
                            <div className="physical-card-title">
                                {translate('modals.modal_voucher_physical_card.content.title')}
                            </div>
                            <p className="text-center">
                                {translate('modals.modal_voucher_physical_card.content.subtitle')}
                            </p>
                            <PincodeControl
                                className={'block-pincode-compact'}
                                value={form.values.code}
                                valueType={'num'}
                                blockSize={4}
                                blockCount={3}
                                cantDeleteSize={3}
                                onChange={(code) => form.update({ code })}
                            />
                            <div className="text-center">
                                <FormError error={form.errors?.code} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {translate('modals.modal_voucher_physical_card.buttons.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={form.values.code.length != 12}
                            className="button button-primary">
                            {translate('modals.modal_voucher_physical_card.buttons.submit')}
                        </button>
                    </div>
                </form>
            )}

            {state === 'success' && (
                <div className="modal-window">
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">
                            {translate('modals.modal_voucher_physical_card.success_card.title')}
                        </div>
                    </div>

                    <div className="modal-content">
                        <div className="modal-section">
                            <div className="physical-card-result">
                                <div className="physical-card-media">
                                    <IconCardSuccess />
                                </div>

                                <div className="physical-card-description">
                                    <TranslateHtml
                                        i18n={'modals.modal_voucher_physical_card.success_card.description'}
                                        values={{ code }}
                                    />
                                </div>

                                <div className="text-center">
                                    <button type="button" className="button button-primary" onClick={modal.close}>
                                        {translate('modals.modal_voucher_physical_card.success_card.button')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
