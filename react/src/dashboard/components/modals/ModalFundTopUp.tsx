import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ResponseError } from '../../props/ApiResponses';
import usePushDanger from '../../hooks/usePushDanger';
import Fund from '../../props/models/Fund';
import { useFundService } from '../../services/FundService';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import { useClipboardService } from '../../services/ClipboardService';
import usePushSuccess from '../../hooks/usePushSuccess';
import useTranslate from '../../hooks/useTranslate';

export default function ModalFundTopUp({
    fund,
    modal,
    onClose,
    className,
}: {
    fund: Fund;
    modal: ModalState;
    onClose: () => void;
    className?: string;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const clipboardService = useClipboardService();

    const [loaded, setLoaded] = useState<boolean>(false);
    const [topUpCode, setTopUpCode] = useState<string>('');
    const [topUpIban, setTopUpIban] = useState<string>('');

    const closeModal = useCallback(() => {
        onClose();
        modal.close();
    }, [modal, onClose]);

    const copyToClipboard = useCallback(
        (value: string) => {
            clipboardService.copy(value).then(() => pushSuccess('Copied to clipboard.'));
        },
        [clipboardService, pushSuccess],
    );

    useEffect(() => {
        fundService
            .topUp(activeOrganization.id, fund.id)
            .then((res) => {
                setTopUpCode(res.data.data.code);
                setTopUpIban(res.data.data.iban);
                setLoaded(true);
            })
            .catch((err: ResponseError) => {
                pushDanger(err.data.message);
                closeModal();
            });
    }, [activeOrganization.id, closeModal, fund.id, fundService, modal, pushDanger]);

    return (
        <div className={`modal modal-md modal-animated ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={closeModal} />
            <form className="modal-window form">
                <div className="modal-close mdi mdi-close" onClick={closeModal} role="button" />
                <div className="modal-header">{translate('modal_funds_add.header.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-funds-added">
                            {!loaded ? (
                                <p className="text-center text-muted">Even geduld a.u.b.</p>
                            ) : (
                                <p>
                                    {translate('modal_funds_add.labels.payment')}
                                    <a
                                        className="text-primary"
                                        onClick={() => copyToClipboard(topUpIban)}
                                        title={translate('modal_funds_add.labels.copy')}>
                                        {topUpIban}
                                    </a>
                                    <br />
                                    {translate('modal_funds_add.labels.addcode')}
                                    <a
                                        className="text-primary"
                                        onClick={() => copyToClipboard(topUpCode)}
                                        title={translate('modal_funds_add.labels.copy')}>
                                        {topUpCode}
                                    </a>
                                    {translate('modal_funds_add.labels.description')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-primary" onClick={closeModal}>
                        {translate('modal_funds_add.buttons.close')}
                    </button>
                </div>
            </form>
        </div>
    );
}
