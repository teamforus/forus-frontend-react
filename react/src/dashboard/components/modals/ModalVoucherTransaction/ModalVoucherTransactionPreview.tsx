import React, { useMemo } from 'react';
import PayoutBankAccount from '../../../props/models/PayoutBankAccount';
import Organization from '../../../props/models/Organization';
import { currencyFormat } from '../../../helpers/string';
import useTranslate from '../../../hooks/useTranslate';

export default function ModalVoucherTransactionPreview({
    formValues,
    providers,
    organization,
    bankAccount,
    bankAccountSource,
}: {
    formValues: {
        target?: string;
        organization_id?: number;
        target_iban?: string;
        target_name?: string;
        amount?: string;
        bank_account_source?: string;
    };
    providers?: Array<Partial<Organization>>;
    organization: Organization;
    bankAccount?: Partial<PayoutBankAccount>;
    bankAccountSource?: string;
}) {
    const translate = useTranslate();
    const resolvedBankAccountSource = bankAccountSource || formValues.bank_account_source;

    const providersById = useMemo(() => {
        return providers?.reduce((list, item) => ({ ...list, [item.id]: item }), {});
    }, [providers]);

    return (
        <div className="modal-section">
            <div className="row">
                <div className="col col-lg-8 col-lg-offset-2">
                    <div className="block block-compact-datalist">
                        {formValues.target === 'provider' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{translate('modals.modal_voucher_transaction.labels.provider')}</strong>
                                </div>
                                <div className="datalist-value">
                                    {providersById?.[formValues.organization_id]?.name}
                                </div>
                            </div>
                        )}

                        {formValues.target === 'iban' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{translate('modals.modal_voucher_transaction.labels.target_iban')}</strong>
                                </div>

                                {resolvedBankAccountSource === 'manual' ? (
                                    <div className="datalist-value">{formValues.target_iban}</div>
                                ) : (
                                    <div className="datalist-value">{bankAccount?.iban}</div>
                                )}
                            </div>
                        )}

                        {formValues.target === 'iban' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{translate('modals.modal_voucher_transaction.labels.target_name')}</strong>
                                </div>

                                {resolvedBankAccountSource === 'manual' ? (
                                    <div className="datalist-value">{formValues.target_name}</div>
                                ) : (
                                    <div className="datalist-value">{bankAccount?.iban_name}</div>
                                )}
                            </div>
                        )}

                        <div className="datalist-row">
                            <div className="datalist-key text-primary text-right">
                                <strong>{translate('modals.modal_voucher_transaction.labels.organization')}</strong>
                            </div>
                            <div className="datalist-value">{organization.name}</div>
                        </div>

                        <div className="datalist-row">
                            <div className="datalist-key text-primary text-right">
                                <strong>{translate('modals.modal_voucher_transaction.labels.amount')}</strong>
                            </div>
                            <div className="datalist-value">{currencyFormat(parseFloat(formValues.amount))}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
