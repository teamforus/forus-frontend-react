import React, { Fragment } from 'react';
import classNames from 'classnames';
import useAppConfigs from '../../hooks/useAppConfigs';
import Reservation from '../../../dashboard/props/models/Reservation';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../modules/state_router/StateNavLink';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import { WebshopRoutes } from '../../modules/state_router/RouterBuilder';

export default function ModalProductReserveCancel({
    modal,
    onConfirm,
    reservation,
}: {
    modal: ModalState;
    onConfirm: () => void;
    reservation: Reservation;
}) {
    const appConfigs = useAppConfigs();
    const translate = useTranslate();

    return (
        <div
            className={classNames('modal', 'modal-product-reserve', 'modal-animated', !modal.loading && 'modal-loaded')}
            data-dusk="modalProductReserveCancel">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('modal_product_reserve_cancel.buttons.close')}
            />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('modal_product_reserve_cancel.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('modal_product_reserve_cancel.title')}</h2>
                </div>

                <div className="modal-body">
                    <div className="modal-section">
                        {reservation.cancelable ? (
                            <Fragment>
                                <div className="modal-section-icon modal-section-icon-warning">
                                    <em className="mdi mdi-alert-outline" />
                                </div>
                                <h2 className="modal-section-title">
                                    {translate(
                                        `modal_product_reserve_cancel.header_pending.title_${appConfigs?.communication_type}`,
                                    )}
                                </h2>

                                <div className="modal-section-description">
                                    <div>
                                        {translate(
                                            `modal_product_reserve_cancel.description_pending.${appConfigs?.communication_type}`,
                                        )}
                                    </div>
                                </div>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <h2 className="modal-section-title">
                                    {translate('modal_product_reserve_cancel.header_not_cancelable.title', {
                                        organizationName: reservation?.product?.organization.name,
                                    })}
                                </h2>
                                <div className="modal-section-description">
                                    <div>{translate('modal_product_reserve_cancel.description_not_cancelable')}</div>
                                    <div>
                                        <strong>
                                            {translate('modal_product_reserve_cancel.contact_provider') + ' '}
                                            <StateNavLink
                                                name={WebshopRoutes.PROVIDER}
                                                params={{ id: reservation.product?.organization?.id }}
                                                target="_blank">
                                                {reservation.product?.organization?.name}
                                            </StateNavLink>
                                            !
                                        </strong>
                                        <br />
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="button button-sm button-light" onClick={modal.close}>
                        {translate('modal_product_reserve_cancel.buttons.cancel')}
                    </button>
                    {reservation.cancelable && (
                        <button
                            className="button button-sm button-primary"
                            onClick={() => {
                                modal.close();
                                onConfirm?.();
                            }}
                            data-dusk="btnSubmit">
                            {translate('modal_product_reserve_cancel.buttons.confirm')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
