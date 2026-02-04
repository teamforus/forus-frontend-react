import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import useSetProgress from '../../../dashboard/hooks/useSetProgress';
import usePushDanger from '../../../dashboard/hooks/usePushDanger';
import FormGroup from '../elements/forms/FormGroup';
import SelectControl from '../../../dashboard/components/elements/select-control/SelectControl';
import Voucher from '../../../dashboard/props/models/Voucher';
import usePayoutTransactionService from '../../services/PayoutTransactionService';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import SelectControlOptionsVouchers from '../elements/select-control/templates/SelectControlOptionsVouchers';
import usePayoutEligibleVouchers from '../pages/vouchers-show/hooks/usePayoutEligibleVouchers';
import UIControlCheckbox from '../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import { currencyFormat } from '../../../dashboard/helpers/string';
import BlockWarning from '../elements/block-warning/BlockWarning';
import TranslateHtml from '../../../dashboard/components/elements/translate-html/TranslateHtml';
import useFundRequestBankAccounts from '../../hooks/useFundRequestBankAccounts';

export default function ModalVoucherPayout({
    modal,
    vouchers,
    selectedVoucher,
    onCreated,
}: {
    modal: ModalState;
    vouchers?: Array<Voucher>;
    selectedVoucher?: Voucher;
    onCreated?: () => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushDanger = usePushDanger();

    const payoutService = usePayoutTransactionService();

    const [state, setState] = useState<'form' | 'success'>('form');
    const [voucherList] = useState<Array<Voucher>>(vouchers || []);

    const { fundRequestAccounts } = useFundRequestBankAccounts();
    const eligibleVouchers = usePayoutEligibleVouchers(voucherList, fundRequestAccounts);

    const finish = useCallback(() => {
        modal.close();
        onCreated?.();
    }, [modal, onCreated]);

    const form = useFormBuilder(
        {
            voucher_id: selectedVoucher?.id || eligibleVouchers?.[0]?.id || null,
            amount: '',
            accept_compliance_rules: false,
            fund_request_id: fundRequestAccounts?.[0]?.type_id || null,
        },
        (values) => {
            setProgress(0);

            payoutService
                .store({
                    voucher_id: values.voucher_id,
                    amount: values.amount,
                    fund_request_id: values.fund_request_id,
                })
                .then(() => {
                    setState('success');
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors || null);
                    pushDanger(translate('push.error'), err.data.message);
                })
                .finally(() => setProgress(100));
        },
    );

    const selectedVoucherItem = useMemo(() => {
        return eligibleVouchers.find((voucher) => voucher.id === form.values.voucher_id);
    }, [eligibleVouchers, form.values.voucher_id]);

    const selectedBankAccount = useMemo(() => {
        return fundRequestAccounts?.find((account) => account.type_id === form.values.fund_request_id);
    }, [fundRequestAccounts, form.values.fund_request_id]);

    const fundRequestOptions = useMemo(() => {
        return (fundRequestAccounts || []).map((account) => ({
            id: account.type_id,
            name: `${account.created_by_locale} #${account.type_id} - ${account.iban} / ${account.name}`,
        }));
    }, [fundRequestAccounts]);

    const selectedVoucherId = selectedVoucherItem?.id;
    const updateForm = form.update;

    const fixedPayoutAmount = useMemo(() => {
        return selectedVoucherItem?.fund?.voucher_payout_fixed_amount;
    }, [selectedVoucherItem?.fund?.voucher_payout_fixed_amount]);

    const payoutCountWarning = useMemo(() => {
        if (!selectedVoucherItem) {
            return null;
        }

        const payoutLimit = selectedVoucherItem?.fund?.allow_voucher_payout_count;

        if (payoutLimit === null || payoutLimit === undefined) {
            return null;
        }

        if (selectedVoucherItem?.requester_payouts_count >= payoutLimit) {
            return translate('voucher.payout.warning_count_reached', {
                count: payoutLimit,
            });
        }

        return null;
    }, [selectedVoucherItem, translate]);

    const payoutAmountWarning = useMemo(() => {
        if (!selectedVoucherItem) {
            return null;
        }

        const voucherAmount = parseFloat(selectedVoucherItem?.amount) || 0;

        if (fixedPayoutAmount !== null && fixedPayoutAmount !== undefined) {
            const fixedAmount = parseFloat(fixedPayoutAmount) || 0;

            return voucherAmount < fixedAmount
                ? translate('voucher.payout.warning_not_enough_amount_fixed', {
                      amount: currencyFormat(fixedAmount),
                  })
                : null;
        }

        return voucherAmount < 0.1
            ? translate('voucher.payout.warning_not_enough_amount_min', {
                  min: currencyFormat(0.1),
              })
            : null;
    }, [fixedPayoutAmount, selectedVoucherItem, translate]);

    const warningMessage = payoutCountWarning || payoutAmountWarning;

    useEffect(() => {
        if (!selectedVoucherId) {
            return;
        }

        if (fixedPayoutAmount !== null && fixedPayoutAmount !== undefined) {
            updateForm({ amount: fixedPayoutAmount });
        } else {
            updateForm({ amount: '' });
        }
    }, [fixedPayoutAmount, selectedVoucherId, updateForm]);

    useEffect(() => {
        if (!fundRequestAccounts?.length) {
            return;
        }

        if (!form.values.fund_request_id) {
            updateForm({ fund_request_id: fundRequestAccounts[0].type_id });
            return;
        }

        if (!fundRequestAccounts.find((account) => account.type_id === form.values.fund_request_id)) {
            updateForm({ fund_request_id: fundRequestAccounts[0].type_id });
        }
    }, [fundRequestAccounts, form.values.fund_request_id, updateForm]);

    useEffect(() => {
        if (!eligibleVouchers.length || form.values.voucher_id) {
            return;
        }

        updateForm({ voucher_id: eligibleVouchers[0].id });
    }, [eligibleVouchers, form.values.voucher_id, updateForm]);

    const disableSubmit = useMemo(() => {
        return (
            form.isLocked ||
            !form.values.voucher_id ||
            !form.values.amount ||
            !form.values.fund_request_id ||
            !form.values.accept_compliance_rules ||
            Boolean(warningMessage)
        );
    }, [
        form.isLocked,
        form.values.accept_compliance_rules,
        form.values.amount,
        form.values.fund_request_id,
        form.values.voucher_id,
        warningMessage,
    ]);

    return (
        <div className={classNames('modal', 'modal-animated', !modal.loading && 'modal-loaded')} role="dialog">
            <div className="modal-backdrop" onClick={modal.close} aria-label="Close modal" role="button" />

            {state === 'form' && (
                <form className="modal-window form" onSubmit={form.submit} data-dusk="voucherPayoutForm">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        role="button"
                        aria-label="Close modal"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('voucher.actions.transfer_to_bank')}</h2>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <h2 className="modal-section-title">{translate('voucher.actions.transfer_to_bank')}</h2>
                            <div className="modal-section-description">
                                {translate('voucher.actions.transfer_to_bank_description')}
                            </div>
                        </div>

                        <div className="modal-section">
                            <FormGroup
                                label={translate('voucher.payout.voucher_label')}
                                error={form.errors?.voucher_id}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        className="form-control"
                                        propKey="id"
                                        propValue="address"
                                        allowSearch={false}
                                        options={eligibleVouchers}
                                        value={form.values.voucher_id ?? ''}
                                        onChange={(voucher_id?: number) => form.update({ voucher_id })}
                                        optionsComponent={SelectControlOptionsVouchers}
                                        disabled={Boolean(selectedVoucher)}
                                        dusk="voucherPayoutVoucherSelect"
                                    />
                                )}
                            />

                            {warningMessage && <BlockWarning>{warningMessage}</BlockWarning>}

                            {!warningMessage && (
                                <Fragment>
                                    {fundRequestOptions.length > 1 && (
                                        <FormGroup
                                            label={translate('profile.bank_accounts.source')}
                                            error={form.errors?.fund_request_id}
                                            input={(id) => (
                                                <SelectControl
                                                    id={id}
                                                    className="form-control"
                                                    propKey="id"
                                                    propValue="name"
                                                    allowSearch={false}
                                                    options={fundRequestOptions}
                                                    value={form.values.fund_request_id ?? ''}
                                                    onChange={(fund_request_id?: number) =>
                                                        form.update({ fund_request_id })
                                                    }
                                                    dusk="voucherPayoutFundRequestSelect"
                                                />
                                            )}
                                        />
                                    )}

                                    <FormGroup
                                        label={translate('voucher.payout.amount')}
                                        required={true}
                                        error={form.errors?.amount}
                                        input={(id) => {
                                            if (fixedPayoutAmount !== null && fixedPayoutAmount !== undefined) {
                                                const amountNumber = parseFloat(fixedPayoutAmount);
                                                const displayValue = isNaN(amountNumber)
                                                    ? fixedPayoutAmount
                                                    : currencyFormat(amountNumber);

                                                return (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        type="text"
                                                        value={displayValue}
                                                        disabled={true}
                                                        data-dusk="voucherPayoutAmount"
                                                    />
                                                );
                                            }

                                            return (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    type="number"
                                                    min={0.1}
                                                    step={0.01}
                                                    value={form.values.amount}
                                                    onChange={(e) => form.update({ amount: e.target.value })}
                                                    placeholder={translate('voucher.payout.amount')}
                                                    data-dusk="voucherPayoutAmount"
                                                />
                                            );
                                        }}
                                    />

                                    <div className="row">
                                        <div className="col col-xs-12 col-md-6">
                                            <FormGroup
                                                label={translate('voucher.payout.iban')}
                                                required={true}
                                                input={(id) => (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        type="text"
                                                        disabled={true}
                                                        value={selectedBankAccount?.iban || ''}
                                                        placeholder={translate('voucher.payout.iban')}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col col-xs-12 col-md-6">
                                            <FormGroup
                                                label={translate('voucher.payout.iban_name')}
                                                required={true}
                                                error={form.errors?.iban_name}
                                                input={(id) => (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        type="text"
                                                        disabled={true}
                                                        value={selectedBankAccount?.name || ''}
                                                        placeholder={translate('voucher.payout.iban_name')}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormGroup
                                        label={translate('voucher.payout.accept_compliance_rules_label')}
                                        required={true}
                                        input={(id) => (
                                            <div className="flex flex-gap flex-vertical">
                                                <BlockWarning>
                                                    <div className="block block-markdown">
                                                        <TranslateHtml
                                                            i18n={'voucher.payout.accept_compliance_rules_info'}
                                                        />
                                                    </div>
                                                </BlockWarning>
                                                <UIControlCheckbox
                                                    id={id}
                                                    checked={form.values.accept_compliance_rules}
                                                    name="accept_compliance_rules"
                                                    label={translate('voucher.payout.accept_compliance_rules')}
                                                    slim={true}
                                                    dataDusk="voucherPayoutAcceptRules"
                                                    onChangeValue={(accept_compliance_rules) =>
                                                        form.update({ accept_compliance_rules })
                                                    }
                                                />
                                            </div>
                                        )}
                                    />
                                </Fragment>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="button button-light button-sm show-sm flex-grow"
                            type="button"
                            onClick={modal.close}>
                            {translate('voucher.payout.cancel')}
                        </button>

                        <button
                            className="button button-primary button-sm show-sm flex-grow"
                            type="submit"
                            disabled={disableSubmit}
                            data-dusk="voucherPayoutSubmitMobile">
                            {translate('voucher.payout.submit')}
                        </button>

                        <div className="flex flex-grow hide-sm">
                            <button className="button button-light button-sm" type="button" onClick={modal.close}>
                                {translate('voucher.payout.cancel')}
                            </button>
                        </div>

                        <div className="flex hide-sm">
                            <button
                                type="submit"
                                className="button button-primary button-sm"
                                disabled={disableSubmit}
                                data-dusk="voucherPayoutSubmit">
                                {translate('voucher.payout.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {state === 'success' && (
                <div className="modal-window" data-dusk="voucherPayoutSuccess">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        role="button"
                        aria-label="Close modal"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('voucher.actions.transfer_to_bank')}</h2>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section text-center">
                            <div className="modal-section-icon modal-section-icon-success">
                                <div className="mdi mdi-check-circle-outline" />
                            </div>
                            <h2 className="modal-section-title">{translate('voucher.payout.success.title')}</h2>
                            <div className="modal-section-description">
                                {translate('voucher.payout.success.description')}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="button button-sm button-light"
                            type="button"
                            onClick={finish}
                            data-dusk="voucherPayoutSuccessClose">
                            {translate('voucher.payout.success.close')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
