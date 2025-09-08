import React, { useCallback, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import Voucher from '../../../dashboard/props/models/Voucher';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import { usePhysicalCardsService } from '../../services/PhysicalCardsService';
import usePushDanger from '../../../dashboard/hooks/usePushDanger';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalPhysicalCardUnlink({
    modal,
    voucher,
    onPhysicalCardUnlinked,
    onClose,
}: {
    modal: ModalState;
    voucher?: Voucher;
    onPhysicalCardUnlinked?: () => void;
    onClose?: (requestNew?: boolean) => void;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const physicalCardsService = usePhysicalCardsService();

    const [state, setState] = useState<'start' | 'unlinked'>('start');

    const unlink = useCallback(() => {
        physicalCardsService
            .destroy(voucher.number, voucher.physical_card.id)
            .then(() => {
                onPhysicalCardUnlinked();
                setState('unlinked');
            })
            .catch((err: ResponseError) => pushDanger(translate('push.error'), err.data?.message));
    }, [onPhysicalCardUnlinked, physicalCardsService, pushDanger, voucher, translate]);

    const requestNewCard = useCallback(() => {
        onClose?.(true);
        modal.close();
    }, [modal, onClose]);

    const closeModal = useCallback(() => {
        onClose?.(false);
        modal.close();
    }, [modal, onClose]);

    return (
        <div className={`modal modal-animated modal-physical-cards ${modal.loading ? '' : 'modal-loaded'}`}>
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('modal_physical_card_unlink.buttons.close')}
            />

            {state == 'start' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={closeModal}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card_unlink.buttons.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">
                            {translate('modal_physical_card_unlink.header.block_card')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-warning">
                                <em className="mdi mdi-alert-outline" />
                            </div>
                            <div className="modal-section-description">
                                {translate('modal_physical_card_unlink.body.block_card', {
                                    cardNumber: voucher.physical_card.code_locale,
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={closeModal}>
                            {translate('modal_physical_card_unlink.buttons.cancel')}
                        </button>
                        <button className="button button-sm button-dark" type="button" onClick={unlink}>
                            {translate('modal_physical_card_unlink.buttons.block')}
                        </button>
                    </div>
                </div>
            )}

            {state == 'unlinked' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={closeModal}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card_unlink.buttons.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">
                            {translate('modal_physical_card_unlink.header.card_blocked')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <em className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-description">
                                {translate('modal_physical_card_unlink.body.card_blocked', {
                                    cardNumber: voucher.physical_card.code_locale,
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={closeModal}>
                            {translate('modal_physical_card_unlink.buttons.close')}
                        </button>
                        <button className="button button-sm button-dark" type="button" onClick={requestNewCard}>
                            {translate('modal_physical_card_unlink.buttons.request_new')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
