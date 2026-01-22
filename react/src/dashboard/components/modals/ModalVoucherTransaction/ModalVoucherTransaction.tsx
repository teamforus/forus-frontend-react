import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import { hasPermission } from '../../../helpers/utils';
import useFormBuilder from '../../../hooks/useFormBuilder';
import SponsorVoucher from '../../../props/models/Sponsor/SponsorVoucher';
import Organization, { Permission } from '../../../props/models/Organization';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { useOrganizationService } from '../../../services/OrganizationService';
import usePayoutBankAccounts, { BankAccountSource } from '../../../hooks/usePayoutBankAccounts';
import useVoucherService from '../../../services/VoucherService';
import SelectControl from '../../elements/select-control/SelectControl';
import FormError from '../../elements/forms/errors/FormError';
import { currencyFormat } from '../../../helpers/string';
import ModalVoucherTransactionPreview from './ModalVoucherTransactionPreview';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import { ResponseError } from '../../../props/ApiResponses';
import InfoBox from '../../elements/info-box/InfoBox';

const resetBankAccountIds = () => ({
    fund_request_id: null,
    profile_bank_account_id: null,
    reimbursement_id: null,
    payout_transaction_id: null,
});

const BANK_ACCOUNT_SOURCE_FIELDS: Record<
    Exclude<BankAccountSource, 'manual'>,
    keyof {
        fund_request_id?: number;
        profile_bank_account_id?: number;
        reimbursement_id?: number;
        payout_transaction_id?: number;
    }
> = {
    fund_request: 'fund_request_id',
    profile_bank_account: 'profile_bank_account_id',
    reimbursement: 'reimbursement_id',
    payout: 'payout_transaction_id',
};

export default function ModalVoucherTransaction({
    modal,
    target,
    voucher,
    onCreated,
    className,
    organization,
}: {
    modal: ModalState;
    target?: string;
    voucher: SponsorVoucher;
    onCreated: () => void;
    className?: string;
    organization: Organization;
}) {
    const translate = useTranslate();

    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const organizationService = useOrganizationService();
    const [fund, setFund] = useState<Fund>(null);
    const [state, setState] = useState<'form' | 'finish' | 'preview'>('form');
    const [providers, setProviders] = useState<Array<Partial<Organization>>>([]);
    const [bankAccountSource, setBankAccountSource] = useState<BankAccountSource>('manual');

    const targets = useMemo(() => {
        const targetProvider = {
            key: 'provider',
            name: translate(`modals.modal_voucher_transaction.labels.target_provider_option`),
        };

        const targetDirect = {
            key: 'iban',
            name: translate('modals.modal_voucher_transaction.labels.target_iban_option'),
        };

        return [targetProvider, fund?.allow_direct_payments ? targetDirect : null].filter((target) => target);
    }, [fund?.allow_direct_payments, translate]);

    const canUseReimbursements = useMemo(() => {
        return (
            fund?.allow_reimbursements &&
            fund?.allow_direct_payments &&
            hasPermission(organization, Permission.MANAGE_REIMBURSEMENTS)
        );
    }, [fund?.allow_direct_payments, fund?.allow_reimbursements, organization]);

    const bankAccountSourceOptions = useMemo(() => {
        return [
            {
                key: 'manual',
                name: translate('modals.modal_voucher_transaction.options.bank_account_source_manual'),
            },
            {
                key: 'fund_request',
                name: translate('modals.modal_voucher_transaction.options.bank_account_source_fund_request'),
            },
            {
                key: 'profile_bank_account',
                name: translate('modals.modal_voucher_transaction.options.bank_account_source_profile_bank_account'),
            },
            ...(canUseReimbursements
                ? [
                      {
                          key: 'reimbursement',
                          name: translate('modals.modal_voucher_transaction.options.bank_account_source_reimbursement'),
                      },
                  ]
                : []),
            {
                key: 'payout',
                name: translate('modals.modal_voucher_transaction.options.bank_account_source_payout'),
            },
        ];
    }, [canUseReimbursements, translate]);

    const amountLimit = useMemo(() => {
        if (!fund) {
            return null;
        }

        if (target === 'top_up') {
            return Math.min(
                parseFloat(fund?.limit_voucher_top_up_amount),
                parseFloat(fund?.limit_voucher_total_amount) - parseFloat(voucher.amount_total),
            );
        }

        return voucher.amount_available;
    }, [fund, target, voucher]);

    const form = useFormBuilder<{
        target?: string;
        target_iban?: string;
        target_name?: string;
        note?: string;
        note_shared?: boolean;
        amount?: string;
        voucher_id?: number;
        organization_id?: number;
        bank_account_source?: BankAccountSource;
        fund_request_id?: number | null;
        profile_bank_account_id?: number | null;
        reimbursement_id?: number | null;
        payout_transaction_id?: number | null;
    }>(
        {
            note: '',
            note_shared: false,
            amount: null,
            target: target || targets[0]?.key,
            voucher_id: voucher.id,
            organization_id: providers[0]?.id,
            bank_account_source: bankAccountSource,
            ...resetBankAccountIds(),
        },

        (values) => {
            const { note, note_shared, amount, target, voucher_id } = values;
            const data = { note, note_shared, amount, target, voucher_id };

            if (target === 'provider') {
                Object.assign(data, { organization_id: values.organization_id });
            } else if (form.values.target === 'iban') {
                const { bank_account_source, target_iban, target_name } = form.values;

                if (bank_account_source === 'manual') {
                    Object.assign(data, { target_iban, target_name });
                } else if (bank_account_source) {
                    const fieldName = BANK_ACCOUNT_SOURCE_FIELDS[bank_account_source];
                    Object.assign(data, { [fieldName]: form.values[fieldName] });
                }
            }

            setProgress(0);

            voucherService
                .makeSponsorTransaction(organization.id, data)
                .then(() => {
                    setState('finish');
                    onCreated?.();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    setState('form');
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: updateForm } = form;

    const { bankAccounts, bankAccountsLoading, bankAccountOptions } = usePayoutBankAccounts({
        organizationId: organization?.id,
        fundId: fund?.id,
        identityId: voucher?.identity_id,
        identityRequired: true,
        bankAccountSource,
        enabled: form.values.target === 'iban',
        placeholderLabel: translate('modals.modal_voucher_transaction.options.bank_account_select_placeholder'),
    });

    const selectedBankAccount = useMemo(() => {
        if (bankAccountSource === 'manual') {
            return null;
        }

        const fieldName = BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource];
        const selectedId = form.values[fieldName];

        return bankAccounts?.find((account) => account.type_id === selectedId) || null;
    }, [bankAccountSource, bankAccounts, form.values]);

    const submitButtonDisabled = useMemo(() => {
        const { target, organization_id, target_iban, target_name, bank_account_source } = form.values;
        const { amount } = form.values;

        if (target === 'provider') {
            return !organization_id || !amount || parseFloat(amount) === 0;
        }

        if (target === 'top_up') {
            return !amount || parseFloat(amount) === 0;
        }

        if (target === 'iban') {
            if (bank_account_source === 'manual') {
                return !target_iban || !target_name || !amount;
            }

            if (bank_account_source) {
                const fieldName = BANK_ACCOUNT_SOURCE_FIELDS[bank_account_source];
                return !form.values[fieldName] || !amount;
            }

            return true;
        }

        return true;
    }, [form.values]);

    const fetchProviders = useCallback(() => {
        organizationService
            .providerOrganizations(organization.id, {
                state: 'accepted',
                resource_type: 'select',
                fund_id: voucher.fund_id,
                allow_budget: 1,
                per_page: 1000,
            })
            .then((res) => {
                const list =
                    res.data.data.length == 1
                        ? res.data.data
                        : [{ id: null, name: 'Selecteer aanbieder' }, ...res.data.data];

                setProviders(list);
                updateForm({ organization_id: list[0]?.id });
            });
    }, [organization.id, organizationService, voucher.fund_id, updateForm]);

    const fetchVoucherFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(voucher.fund.organization_id, voucher.fund_id)
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, setProgress, voucher]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        fetchVoucherFund();
    }, [fetchVoucherFund]);

    useEffect(() => {
        if (canUseReimbursements && bankAccountSource === 'manual') {
            const nextSource: BankAccountSource = 'reimbursement';

            setBankAccountSource(nextSource);
            updateForm({
                bank_account_source: nextSource,
                ...resetBankAccountIds(),
                target_iban: '',
                target_name: '',
            });
            return;
        }

        if (!canUseReimbursements && bankAccountSource === 'reimbursement') {
            const nextSource: BankAccountSource = 'manual';

            setBankAccountSource(nextSource);
            updateForm({
                bank_account_source: nextSource,
                ...resetBankAccountIds(),
                target_iban: '',
                target_name: '',
            });
        }
    }, [bankAccountSource, canUseReimbursements, updateForm]);

    if (!fund) {
        return null;
    }

    return (
        <div
            className={`modal modal-md modal-animated modal-voucher-transaction ${
                modal.loading ? 'modal-loading' : ''
            } ${className || ''}`}
            data-dusk="voucherTransactionModal">
            <div className="modal-backdrop" onClick={modal.close} />

            {state == 'form' && (
                <form className="modal-window form" onSubmit={() => setState('preview')}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    {form.values.target !== 'top_up' ? (
                        <div className="modal-header">{translate('modals.modal_voucher_transaction.title')}</div>
                    ) : (
                        <div className="modal-header">{translate('modals.modal_voucher_transaction.top_up_title')}</div>
                    )}

                    <div className="modal-body">
                        <div className="modal-section modal-section-pad">
                            {targets.length > 1 && form.values.target !== 'top_up' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.target')}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        value={form.values.target}
                                        propKey={'key'}
                                        options={targets}
                                        allowSearch={false}
                                        dusk="voucherTransactionTargetSelect"
                                        onChange={(target: string) => {
                                            form.update({ target });
                                        }}
                                    />
                                    <FormError error={form.errors?.target} />
                                </div>
                            )}

                            {form.values.target === 'provider' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.provider')}
                                    </div>
                                    <SelectControl
                                        className={'form-control'}
                                        value={form.values?.organization_id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        allowSearch={true}
                                        options={providers}
                                        onChange={(organization_id: number) => form.update({ organization_id })}
                                    />
                                    <FormError error={form.errors?.organization_id} />
                                </div>
                            )}

                            {form.values.target === 'iban' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.bank_account_source')}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        value={bankAccountSource}
                                        propKey={'key'}
                                        options={bankAccountSourceOptions}
                                        allowSearch={false}
                                        dusk="voucherTransactionBankAccountSourceSelect"
                                        onChange={(source: BankAccountSource) => {
                                            setBankAccountSource(source);
                                            form.update({
                                                bank_account_source: source,
                                                ...resetBankAccountIds(),
                                                target_iban: '',
                                                target_name: '',
                                            });
                                        }}
                                    />
                                    <FormError error={form.errors?.bank_account_source} />
                                </div>
                            )}

                            {form.values.target === 'iban' && bankAccountSource !== 'manual' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.bank_account')}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        value={form.values[BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]] || null}
                                        propKey={'id'}
                                        propValue={'label'}
                                        options={bankAccountOptions}
                                        allowSearch={true}
                                        dusk="voucherTransactionBankAccountSelect"
                                        onChange={(bank_account_id: number) => {
                                            const selected = bankAccountOptions.find(
                                                (option) => option.id === bank_account_id,
                                            );

                                            form.update({
                                                ...resetBankAccountIds(),
                                                target_iban: selected?.iban || '',
                                                target_name: selected?.iban_name || '',
                                                [BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]]: bank_account_id,
                                            });
                                        }}
                                        disabled={bankAccountsLoading}
                                    />
                                    <FormError
                                        error={
                                            form.errors?.fund_request_id ||
                                            form.errors?.profile_bank_account_id ||
                                            form.errors?.reimbursement_id ||
                                            form.errors?.payout_transaction_id
                                        }
                                    />
                                </div>
                            )}

                            {form.values.target === 'iban' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.target_iban')}
                                    </div>

                                    <input
                                        type={'text'}
                                        className="form-control"
                                        value={form.values.target_iban || ''}
                                        placeholder="IBAN-nummer"
                                        onChange={(e) => form.update({ target_iban: e.target.value })}
                                        disabled={bankAccountSource !== 'manual'}
                                        data-dusk="voucherTransactionTargetIban"
                                    />

                                    <FormError error={form.errors?.target_iban} />
                                </div>
                            )}

                            {form.values.target === 'iban' && (
                                <div className="form-group">
                                    <div className="form-label form-label-required">
                                        {translate('modals.modal_voucher_transaction.labels.target_name')}
                                    </div>

                                    <input
                                        type={'text'}
                                        className="form-control"
                                        value={form.values.target_name || ''}
                                        placeholder="IBAN-naam"
                                        onChange={(e) => form.update({ target_name: e.target.value })}
                                        disabled={bankAccountSource !== 'manual'}
                                        data-dusk="voucherTransactionTargetName"
                                    />

                                    <FormError error={form.errors?.target_name} />
                                </div>
                            )}

                            <div className="form-group">
                                <div className="form-label form-label-required">
                                    {translate('modals.modal_voucher_transaction.labels.amount')}
                                </div>

                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.values.amount || ''}
                                    step=".01"
                                    min=".02"
                                    max={amountLimit}
                                    placeholder={translate('modals.modal_voucher_transaction.labels.amount')}
                                    onChange={(e) => form.update({ amount: e.target.value })}
                                    data-dusk="voucherTransactionAmount"
                                />
                                {!form.errors?.amount ? (
                                    <div className="form-hint">
                                        Limiet {currencyFormat(parseFloat(amountLimit?.toString()))}
                                    </div>
                                ) : (
                                    <FormError error={form.errors?.amount} />
                                )}

                                <FormError error={form.errors?.amount} />
                            </div>

                            <div className="form-group">
                                <div className="form-label">
                                    {translate('modals.modal_voucher_transaction.labels.note')}
                                </div>

                                <textarea
                                    className="form-control r-n"
                                    value={form.values.note}
                                    placeholder={translate('modals.modal_voucher_transaction.labels.note')}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                                {!form.errors?.note ? (
                                    <div className="form-hint">Max. 255 tekens</div>
                                ) : (
                                    <FormError error={form.errors?.note} />
                                )}

                                <FormError error={form.errors?.note} />
                            </div>

                            {form.values.target === 'provider' && (
                                <Fragment>
                                    <div className="form-group">
                                        <div className="form-label" />

                                        <label className="checkbox">
                                            <input
                                                type="checkbox"
                                                checked={form.values.note_shared}
                                                onChange={(e) => form.update({ note_shared: e.target.checked })}
                                            />
                                            <div className="checkbox-label">
                                                <div className="checkbox-box">
                                                    <div className="mdi mdi-check" />
                                                </div>
                                                {translate('modals.modal_voucher_transaction.labels.note_shared')}
                                            </div>
                                        </label>

                                        <FormError error={form.errors?.note_shared} />
                                    </div>

                                    <InfoBox type={'default'}>
                                        Controleer de gegevens. Na het aanmaken kan de transactie niet worden
                                        verwijderd.
                                    </InfoBox>
                                </Fragment>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {translate('modals.modal_voucher_transaction.buttons.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="button button-primary"
                            data-dusk="voucherTransactionSubmit"
                            disabled={submitButtonDisabled}>
                            {translate('modals.modal_voucher_transaction.buttons.submit')}
                        </button>
                    </div>
                </form>
            )}

            {state == 'preview' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                    <div className="modal-icon modal-icon-primary">
                        <div className="mdi mdi-alert-outline" />
                    </div>

                    <div className="modal-body form">
                        <div className="modal-section">
                            <div className="modal-heading text-center">
                                {translate('modals.modal_voucher_transaction.preview.title')}
                            </div>
                        </div>

                        <ModalVoucherTransactionPreview
                            formValues={form.values}
                            providers={providers}
                            organization={organization}
                            bankAccount={selectedBankAccount}
                            bankAccountSource={bankAccountSource}
                        />

                        <div className="modal-section">
                            <div className="modal-text text-center">
                                {translate('modals.modal_voucher_transaction.preview.description')}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer modal-footer-light text-center">
                        <button type="button" className="button button-default" onClick={() => setState('form')}>
                            {translate('modals.modal_voucher_transaction.buttons.cancel')}
                        </button>

                        <button
                            type="button"
                            className="button button-primary"
                            data-dusk="voucherTransactionPreviewSubmit"
                            onClick={() => form.submit()}>
                            {translate('modals.modal_voucher_transaction.buttons.submit')}
                        </button>
                    </div>
                </div>
            )}

            {state == 'finish' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                    <div className="modal-icon modal-icon-primary">
                        <div className="mdi mdi-check-circle-outline" />
                    </div>

                    <div className="modal-body form">
                        {form.values.target !== 'top_up' ? (
                            <div className="modal-section text-center">
                                <div className="modal-heading">
                                    {translate('modals.modal_voucher_transaction.success.title')}
                                </div>
                                <div className="modal-text">
                                    {translate('modals.modal_voucher_transaction.success.description')}
                                </div>
                            </div>
                        ) : (
                            <div className="modal-section text-center">
                                <div className="modal-heading">
                                    {translate('modals.modal_voucher_transaction.success.top_up_title')}
                                </div>
                                <div className="modal-text">
                                    {translate('modals.modal_voucher_transaction.success.top_up_description')}
                                </div>
                            </div>
                        )}

                        <ModalVoucherTransactionPreview
                            formValues={form.values}
                            organization={organization}
                            providers={providers}
                            bankAccount={selectedBankAccount}
                            bankAccountSource={bankAccountSource}
                        />
                    </div>

                    <div className="modal-footer modal-footer-light text-centers">
                        <button
                            type="button"
                            className="button button-primary"
                            data-dusk="voucherTransactionClose"
                            onClick={modal.close}>
                            {translate('modals.modal_voucher_transaction.buttons.close')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
