import React, { useEffect, useMemo, useState } from 'react';
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
import PayoutBankAccount from '../../props/models/PayoutBankAccount';

type AmountType = 'custom' | 'predefined';
type BankAccountSource = 'manual' | 'fund_request';

type PayoutBankAccountOption = {
    id: number | null;
    iban?: string;
    iban_name?: string;
    label: string;
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

    const [fund, setFund] = useState(funds?.[0]);
    const [bankAccountSource, setBankAccountSource] = useState<BankAccountSource>('manual');
    const [bankAccounts, setBankAccounts] = useState<Array<PayoutBankAccount>>(null);
    const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

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

    const amountOptions = useMemo(() => {
        return [
            fund?.allow_custom_amounts ? { key: 'custom', name: 'Vrij bedrag' } : null,
            fund?.allow_preset_amounts && fund?.amount_presets.length > 0
                ? { key: 'predefined', name: 'Vaste bedragen op basis van categorieën' }
                : null,
        ].filter((option) => option) as Array<{ key: AmountType; name: string }>;
    }, [fund]);

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
        ] as Array<{ key: BankAccountSource; label: string }>;
    }, [translate]);

    const bankAccountOptions = useMemo((): Array<PayoutBankAccountOption> => {
        const options = (bankAccounts || []).map((bankAccount) => ({
            id: bankAccount.id,
            iban: bankAccount.iban,
            iban_name: bankAccount.iban_name,
            label: `Aanvraag #${bankAccount.id} - ${bankAccount.iban} / ${bankAccount.iban_name}`,
        }));

        return [
            {
                id: null,
                label: translate('modals.modal_payout_create.options.bank_account_select_placeholder'),
            },
            ...options,
        ];
    }, [bankAccounts, translate]);

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
    }>(
        {
            amount: transaction?.amount || '',
            target_iban: transaction?.iban_to || '',
            target_name: transaction?.iban_to_name || '',
            allocate_by: transaction
                ? transaction?.amount_preset_id
                    ? 'predefined'
                    : 'custom'
                : amountOptions?.[0]?.key,
            amount_preset_id: transaction?.amount_preset_id || amountValueOptions?.[0]?.id,
            description: transaction?.description || '',
            email: '',
            bsn: '',
            fund_request_id: null,
        },
        (values) => {
            setProgress(0);

            const data = {
                description: values.description,
                ...(bankAccountSource === 'fund_request'
                    ? { fund_request_id: values.fund_request_id || undefined }
                    : {
                          target_iban: values.target_iban,
                          target_name: values.target_name,
                      }),
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
                : payoutTransactionService.store(organization.id, { fund_id: fund.id, ...data });

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
    const formUpdate = form.update;

    useEffect(() => {
        if (transaction || bankAccountSource !== 'fund_request' || !organization?.id || !fund?.id) {
            return;
        }

        let canceled = false;

        const fetchBankAccounts = async () => {
            formUpdate({ fund_request_id: null, target_iban: '', target_name: '' });
            setProgress(0);
            setBankAccountsLoading(true);

            const collected: Array<PayoutBankAccount> = [];
            let page = 1;
            let lastPage = 1;

            try {
                do {
                    const res = await payoutTransactionService.bankAccounts(organization.id, {
                        page,
                        per_page: 1000,
                    });

                    collected.push(...(res.data?.data || []));
                    lastPage = res.data?.meta?.last_page || page;
                    page += 1;
                } while (!canceled && page <= lastPage);

                if (!canceled) {
                    setBankAccounts(collected);
                }
            } catch (err) {
                if (!canceled) {
                    setBankAccounts([]);
                    pushApiError(err);
                }
            } finally {
                if (!canceled) {
                    setBankAccountsLoading(false);
                    setProgress(100);
                }
            }
        };

        fetchBankAccounts().then();

        return () => {
            canceled = true;
        };
    }, [
        bankAccountSource,
        fund?.id,
        organization?.id,
        payoutTransactionService,
        pushApiError,
        setProgress,
        transaction,
        formUpdate,
    ]);

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
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={fund}
                                    propValue={'name'}
                                    disabled={!!transaction?.id}
                                    dusk="payoutFundSelect"
                                    onChange={(fund: Fund) => {
                                        setFund(fund);
                                        form.update({ allocate_by: amountOptions?.[0]?.key, fund_request_id: null });
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
                                        min="0.01"
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
                                                fund_request_id: null,
                                                ...(value === 'fund_request'
                                                    ? { target_iban: '', target_name: '' }
                                                    : {}),
                                            });
                                        }}
                                        options={bankAccountSourceOptions}
                                        allowSearch={false}
                                    />
                                )}
                            />
                        )}

                        {!transaction && bankAccountSource === 'fund_request' && (
                            <FormGroup
                                required={true}
                                label={translate('modals.modal_payout_create.labels.bank_account')}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        value={form.values.fund_request_id}
                                        propKey={'id'}
                                        propValue={'label'}
                                        dusk="payoutFundRequestSelect"
                                        onChange={(fund_request_id: number) => {
                                            const selected = bankAccountOptions.find(
                                                (option) => option.id == fund_request_id,
                                            );

                                            form.update({
                                                fund_request_id,
                                                target_iban: selected?.iban || '',
                                                target_name: selected?.iban_name || '',
                                            });
                                        }}
                                        options={bankAccountOptions}
                                        allowSearch={true}
                                        disabled={bankAccountsLoading}
                                    />
                                )}
                                error={form.errors?.fund_request_id}
                            />
                        )}

                        <FormGroup
                            required={bankAccountSource !== 'fund_request'}
                            label={translate('modals.modal_payout_create.labels.iban')}
                            input={(id) => (
                                <input
                                    id={id}
                                    className="form-control"
                                    placeholder={translate('modals.modal_payout_create.labels.iban')}
                                    data-dusk="payoutTargetIban"
                                    value={form.values.target_iban || ''}
                                    disabled={!transaction && bankAccountSource === 'fund_request'}
                                    onChange={(e) => form.update({ target_iban: e.target.value })}
                                />
                            )}
                            error={form.errors?.target_iban}
                        />

                        <FormGroup
                            required={bankAccountSource !== 'fund_request'}
                            label={translate('modals.modal_payout_create.labels.iban_name')}
                            input={(id) => (
                                <input
                                    id={id}
                                    className="form-control"
                                    placeholder={translate('modals.modal_payout_create.labels.iban_name')}
                                    data-dusk="payoutTargetName"
                                    value={form.values.target_name || ''}
                                    disabled={!transaction && bankAccountSource === 'fund_request'}
                                    onChange={(e) => form.update({ target_name: e.target.value })}
                                />
                            )}
                            error={form.errors?.target_name}
                        />

                        <FormGroup
                            label={translate('modals.modal_payout_create.labels.description')}
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
