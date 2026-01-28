import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import useTranslate from '../../hooks/useTranslate';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import FormGroup from '../elements/forms/elements/FormGroup';
import usePushApiError from '../../hooks/usePushApiError';
import usePayoutTransactionService from '../../services/PayoutTransactionService';
import PayoutTransaction from '../../props/models/PayoutTransaction';
import { currencyFormat } from '../../helpers/string';
import usePayoutBankAccounts, { BankAccountSource } from '../../hooks/usePayoutBankAccounts';

type AmountType = 'custom' | 'predefined';
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

export default function ModalPayoutEdit({
    funds,
    modal,
    className,
    onCreated,
    onUpdated,
    transaction,
    organization,
}: {
    funds: Array<Partial<Fund>>;
    modal: ModalState;
    className?: string;
    onCreated?: () => void;
    onUpdated?: () => void;
    transaction?: PayoutTransaction;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const payoutTransactionService = usePayoutTransactionService();

    const [fund, setFund] = useState(
        transaction ? funds?.find((fund) => fund.id === transaction?.fund?.id) : funds?.[0],
    );
    const [bankAccountSource, setBankAccountSource] = useState<BankAccountSource>('manual');

    const { bankAccountsLoading, bankAccountOptions } = usePayoutBankAccounts({
        organizationId: organization?.id,
        fundId: fund?.id,
        bankAccountSource,
        enabled: !transaction,
        placeholderLabel: translate('modals.modal_payout_create.options.bank_account_select_placeholder'),
    });

    const assignTypes = useMemo(() => {
        if (transaction) {
            return [];
        }

        return [
            { key: null, label: 'Geen', inputLabel: 'E-mailadres', hasInput: false },
            { key: 'email', label: 'E-mailadres', inputLabel: 'E-mailadres', hasInput: true },
            ...(organization?.bsn_enabled ? [{ key: 'bsn', label: 'BSN', inputLabel: 'BSN', hasInput: true }] : []),
        ];
    }, [transaction, organization?.bsn_enabled]);

    const [assignType, setAssignType] = useState(assignTypes?.[0]);

    const amountOptions = useMemo((): Array<{ key: AmountType; name: string }> => {
        return [
            fund?.allow_custom_amounts ? { key: 'custom', name: 'Vrij bedrag' } : null,
            fund?.allow_preset_amounts && fund?.amount_presets.length > 0
                ? { key: 'predefined', name: 'Vaste bedragen op basis van categorieën' }
                : null,
        ].filter(Boolean) as Array<{ key: AmountType; name: string }>;
    }, [fund]);

    const getDefaultAllocateBy = (fund: Partial<Fund> | undefined): AmountType => {
        if (fund?.allow_custom_amounts) {
            return 'custom';
        }

        if (fund?.allow_preset_amounts && fund?.amount_presets?.length > 0) {
            return 'predefined';
        }

        return 'custom';
    };

    const amountValueOptions = useMemo(() => {
        const options = fund?.allow_preset_amounts ? fund?.amount_presets : [];

        return options.map((item) => ({
            ...item,
            label: `${item.name} ${item.amount_locale}`,
        }));
    }, [fund]);

    const bankAccountSourceOptions = useMemo(() => {
        return [
            {
                key: 'manual',
                label: translate('modals.modal_payout_create.options.bank_account_source_manual'),
            },
            {
                key: 'fund_request',
                label: translate('modals.modal_payout_create.options.bank_account_source_fund_request'),
            },
            {
                key: 'profile_bank_account',
                label: translate('modals.modal_payout_create.options.bank_account_source_profile_bank_account'),
            },
            {
                key: 'reimbursement',
                label: translate('modals.modal_payout_create.options.bank_account_source_reimbursement'),
            },
            {
                key: 'payout',
                label: translate('modals.modal_payout_create.options.bank_account_source_payout'),
            },
        ];
    }, [translate]);

    const form = useFormBuilder<{
        target_iban: string;
        target_name: string;
        amount?: string;
        amount_preset_id?: number;
        allocate_by: AmountType;
        description: string;
        email: string;
        bsn: string;
        fund_request_id?: number;
        profile_bank_account_id?: number;
        reimbursement_id?: number;
        payout_transaction_id?: number;
    }>(
        {
            amount: transaction?.amount || '',
            target_iban: transaction?.iban_to || '',
            target_name: transaction?.iban_to_name || '',
            allocate_by: transaction
                ? transaction?.amount_preset_id
                    ? 'predefined'
                    : 'custom'
                : amountOptions?.[0]?.key || 'custom',
            amount_preset_id: transaction?.amount_preset_id || amountValueOptions?.[0]?.id,
            description: transaction?.description || '',
            email: '',
            bsn: '',
            ...resetBankAccountIds(),
        },
        (values) => {
            setProgress(0);

            const getBankAccountData = () => {
                if (bankAccountSource !== 'manual') {
                    const fieldName = BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource];
                    const fieldValue = values[fieldName];
                    if (fieldValue) {
                        return { [fieldName]: fieldValue };
                    }
                }
                return {
                    target_iban: values.target_iban,
                    target_name: values.target_name,
                };
            };

            const data = {
                description: values.description,
                ...getBankAccountData(),
                amount: values.allocate_by === 'custom' ? values.amount : undefined,
                amount_preset_id: values.allocate_by === 'predefined' ? values.amount_preset_id : undefined,
                ...{
                    email: { email: values.email || '-' },
                    bsn: { bsn: values.bsn || '-' },
                    null: {},
                }[assignType?.key],
            };

            const promise = transaction
                ? payoutTransactionService.update(organization.id, transaction.address, data)
                : payoutTransactionService.store(organization.id, { fund_id: fund?.id, ...data });

            promise
                .then(() => {
                    if (transaction) {
                        onUpdated?.();
                    } else {
                        onCreated?.();
                    }

                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading && 'modal-loading',
                className,
            )}
            data-dusk="payoutCreateModal">
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_payout_create.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <FormGroup
                            required={true}
                            label={translate('modals.modal_payout_create.labels.fund')}
                            info={translate('modals.modal_payout_create.info.fund')}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={fund}
                                    propValue={'name'}
                                    disabled={!!transaction?.id}
                                    onChange={(fund: Fund) => {
                                        setFund(fund);
                                        form.update({
                                            allocate_by: getDefaultAllocateBy(fund),
                                            amount_preset_id: fund?.amount_presets?.[0]?.id,
                                            ...resetBankAccountIds(),
                                            target_iban: '',
                                            target_name: '',
                                        });
                                    }}
                                    options={funds}
                                    allowSearch={false}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            )}
                            error={form.errors?.fund_id}
                        />

                        <FormGroup
                            required={true}
                            label={translate('modals.modal_payout_create.labels.allocate_by')}
                            info={translate('modals.modal_payout_create.info.allocate_by')}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={form.values.allocate_by}
                                    propKey={'key'}
                                    propValue={'name'}
                                    onChange={(allocate_by: AmountType) => form.update({ allocate_by })}
                                    options={amountOptions}
                                    allowSearch={false}
                                />
                            )}
                            error={form.errors?.allocate_by}
                        />

                        <FormGroup
                            required={true}
                            label={translate('modals.modal_payout_create.labels.amount')}
                            info={translate('modals.modal_payout_create.info.amount')}
                            hint={
                                form.values.allocate_by === 'custom' &&
                                fund?.custom_amount_min &&
                                fund?.custom_amount_max
                                    ? `Minimaal ${currencyFormat(Number(fund.custom_amount_min))} en maximaal ${currencyFormat(Number(fund.custom_amount_max))}`
                                    : undefined
                            }
                            input={(id) =>
                                form.values.allocate_by === 'custom' ? (
                                    <input
                                        id={id}
                                        type={'number'}
                                        className="form-control"
                                        placeholder={translate('modals.modal_payout_create.labels.amount')}
                                        data-dusk="payoutAmount"
                                        value={form.values.amount || ''}
                                        step=".01"
                                        min={fund?.custom_amount_min || '0.01'}
                                        max={fund?.custom_amount_max}
                                        onChange={(e) => form.update({ amount: e.target.value })}
                                    />
                                ) : (
                                    <SelectControl
                                        id={id}
                                        value={form.values.amount_preset_id}
                                        propKey={'id'}
                                        propValue={'label'}
                                        onChange={(amount_option_id: number) =>
                                            form.update({ amount_preset_id: amount_option_id })
                                        }
                                        options={amountValueOptions}
                                        allowSearch={false}
                                    />
                                )
                            }
                            error={
                                form.values.allocate_by === 'custom'
                                    ? form.errors?.amount
                                    : form.errors?.amount_preset_id
                            }
                        />

                        {assignTypes.length > 0 && (
                            <FormGroup
                                required={true}
                                label={translate('modals.modal_payout_create.labels.assign_by_type')}
                                info={translate('modals.modal_payout_create.info.assign_by_type')}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        value={assignType}
                                        propValue={'label'}
                                        onChange={setAssignType}
                                        options={assignTypes}
                                        allowSearch={false}
                                    />
                                )}
                            />
                        )}

                        {assignType?.hasInput && (
                            <FormGroup
                                required={true}
                                label={assignType.inputLabel}
                                info={
                                    assignType.key === 'email'
                                        ? translate('modals.modal_payout_create.info.email')
                                        : assignType.key === 'bsn'
                                          ? translate('modals.modal_payout_create.info.bsn')
                                          : undefined
                                }
                                input={(id) => (
                                    <input
                                        id={id}
                                        className="form-control"
                                        placeholder={assignType.inputLabel}
                                        value={form.values[assignType.key] || ''}
                                        onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                    />
                                )}
                                error={form.errors?.[assignType?.key]}
                            />
                        )}

                        {!transaction && (
                            <FormGroup
                                required={true}
                                label={translate('modals.modal_payout_create.labels.bank_account_source')}
                                info={translate('modals.modal_payout_create.info.bank_account_source')}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        value={bankAccountSource}
                                        propKey={'key'}
                                        propValue={'label'}
                                        dusk="payoutBankAccountSourceSelect"
                                        onChange={(value: BankAccountSource) => {
                                            setBankAccountSource(value);
                                            form.update({
                                                ...resetBankAccountIds(),
                                                target_iban: '',
                                                target_name: '',
                                            });
                                        }}
                                        options={bankAccountSourceOptions}
                                        allowSearch={false}
                                    />
                                )}
                            />
                        )}

                        {!transaction && bankAccountSource !== 'manual' && (
                            <FormGroup
                                required={true}
                                label={translate('modals.modal_payout_create.labels.bank_account')}
                                info={translate('modals.modal_payout_create.info.bank_account')}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        value={form.values[BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]] || null}
                                        propKey={'id'}
                                        propValue={'label'}
                                        dusk="payoutBankAccountSelect"
                                        onChange={(bank_account_id: number) => {
                                            const selected = bankAccountOptions.find(
                                                (option) => option.id === bank_account_id,
                                            );

                                            const updateData: {
                                                fund_request_id?: number | null;
                                                profile_bank_account_id?: number | null;
                                                reimbursement_id?: number | null;
                                                payout_transaction_id?: number | null;
                                                target_iban: string;
                                                target_name: string;
                                            } = {
                                                ...resetBankAccountIds(),
                                                target_iban: selected?.iban || '',
                                                target_name: selected?.iban_name || '',
                                                [BANK_ACCOUNT_SOURCE_FIELDS[bankAccountSource]]: bank_account_id,
                                            };

                                            form.update(updateData);
                                        }}
                                        options={bankAccountOptions}
                                        allowSearch={true}
                                        disabled={bankAccountsLoading}
                                    />
                                )}
                                error={
                                    form.errors?.fund_request_id ||
                                    form.errors?.profile_bank_account_id ||
                                    form.errors?.reimbursement_id ||
                                    form.errors?.payout_transaction_id
                                }
                            />
                        )}

                        <FormGroup
                            required={bankAccountSource === 'manual'}
                            label={translate('modals.modal_payout_create.labels.iban')}
                            info={translate('modals.modal_payout_create.info.iban')}
                            input={(id) => (
                                <input
                                    id={id}
                                    className="form-control"
                                    placeholder={translate('modals.modal_payout_create.labels.iban')}
                                    data-dusk="payoutTargetIban"
                                    value={form.values.target_iban || ''}
                                    disabled={!transaction && bankAccountSource !== 'manual'}
                                    onChange={(e) => form.update({ target_iban: e.target.value })}
                                />
                            )}
                            error={form.errors?.target_iban}
                        />

                        <FormGroup
                            required={bankAccountSource === 'manual'}
                            label={translate('modals.modal_payout_create.labels.iban_name')}
                            info={translate('modals.modal_payout_create.info.iban_name')}
                            input={(id) => (
                                <input
                                    id={id}
                                    className="form-control"
                                    placeholder={translate('modals.modal_payout_create.labels.iban_name')}
                                    data-dusk="payoutTargetName"
                                    value={form.values.target_name || ''}
                                    disabled={!transaction && bankAccountSource !== 'manual'}
                                    onChange={(e) => form.update({ target_name: e.target.value })}
                                />
                            )}
                            error={form.errors?.target_name}
                        />

                        <FormGroup
                            label={translate('modals.modal_payout_create.labels.description')}
                            info={translate('modals.modal_payout_create.info.description')}
                            input={(id) => (
                                <textarea
                                    id={id}
                                    className="form-control r-n"
                                    placeholder={translate('modals.modal_payout_create.labels.description')}
                                    value={form.values.description || ''}
                                    onChange={(e) => form.update({ description: e.target.value })}
                                />
                            )}
                            error={form.errors?.description}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_payout_create.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary" data-dusk="payoutSubmit">
                        {translate('modals.modal_payout_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
