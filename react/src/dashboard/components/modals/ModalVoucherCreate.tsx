import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import FormError from '../elements/forms/errors/FormError';
import SelectControl from '../elements/select-control/SelectControl';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../helpers/dates';
import VoucherRecordsEditor from '../pages/vouchers/elements/VoucherRecordsEditor';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useVoucherService from '../../services/VoucherService';
import useTranslate from '../../hooks/useTranslate';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import Record from '../../props/models/Record';
import Product from '../../props/models/Product';
import useProductService from '../../services/ProductService';
import ModalNotification from './ModalNotification';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import usePushApiError from '../../hooks/usePushApiError';
import InfoBox from '../elements/info-box/InfoBox';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalVoucherCreate({
    funds,
    modal,
    fundId,
    className,
    onCreated,
    organization,
}: {
    funds: Array<Partial<Fund>>;
    modal: ModalState;
    fundId?: number;
    className?: string;
    onCreated: () => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const voucherService = useVoucherService();
    const productService = useProductService();

    const [dateMinLimit] = useState(new Date());
    const [expireAsFund, setExpireAsFund] = useState<boolean>(true);
    const [products, setProducts] = useState<Array<Partial<Product>>>(null);
    const [showRecordFields, setShowRecordFields] = useState<boolean>(false);
    const [showGeneralFields, setShowGeneralFields] = useState<boolean>(true);

    const assignTypes = useMemo(
        () => [
            {
                key: 'activation_code',
                label: 'Via activatiecode',
                inputLabel: 'Activatiecode invoeren',
                hasInput: false,
            },
            { key: 'email', label: 'Via e-mail', inputLabel: 'E-mailadres invoeren', hasInput: true },
            ...(organization?.bsn_enabled
                ? [{ key: 'bsn', label: 'Via BSN', inputLabel: 'Burgerservicenummer invoeren', hasInput: true }]
                : []),
        ],
        [organization?.bsn_enabled],
    );

    const creditTypes = useMemo(
        () => [
            { key: 'vouchers', name: 'Budget' },
            { key: 'product_vouchers', name: 'Product' },
        ],
        [],
    );

    const [assignType, setAssignType] = useState(assignTypes[0]);
    const [fund, setFund] = useState(funds.find((fund) => fund.id === fundId) || funds?.[0]);

    const form = useFormBuilder<{
        bsn?: string;
        note: string;
        email?: string;
        amount: string;
        records?: Array<Record>;
        type?: 'vouchers' | 'product_vouchers';
        expire_at: string;
        client_uid?: string;
        product_id?: number;
        limit_multiplier?: number;
        report_type?: 'user' | 'relation';
        notify_provider?: boolean;
    }>(
        {
            bsn: null,
            note: '',
            email: null,
            amount: null,
            records: [],
            type: 'vouchers',
            expire_at: fund?.end_date,
            client_uid: null,
            product_id: null,
            limit_multiplier: 1,
            report_type: 'relation',
            notify_provider: false,
        },
        (values) => {
            setProgress(0);

            if (!fund?.backoffice?.backoffice_enabled) {
                delete values.report_type;
            }

            const data = {
                ...values,
                ...{
                    email: { activate: 1, activation_code: 0 },
                    bsn: { activate: 1, activation_code: 0 },
                    activation_code: { activate: 0, activation_code: 1 },
                }[assignType.key],
                fund_id: fund.id,
                assign_by_type: assignType.key,
                bsn: assignType.key == 'bsn' ? values.bsn : null,
                email: assignType.key == 'email' ? values.email : null,
                records: form.values.records.reduce(
                    (records, record) => ({ ...records, [record.key]: record.value }),
                    {},
                ),
            };

            const makeRequest = () => {
                setProgress(0);

                voucherService
                    .store(organization.id, data)
                    .then(() => {
                        onCreated();
                        modal.close();
                    })
                    .catch((err: ResponseError) => {
                        form.setErrors(err.data.errors);
                        form.setIsLocked(false);
                        pushApiError(err);
                    })
                    .finally(() => {
                        setProgress(100);
                    });
            };

            voucherService
                .storeValidate(organization.id, data)
                .then(() => {
                    if (!['email', 'bsn'].includes(assignType.key)) {
                        return makeRequest();
                    }

                    if (assignType.key === 'email') {
                        voucherService
                            .index(organization.id, {
                                type: form.values.type == 'vouchers' ? 'fund_voucher' : 'product_voucher',
                                email: form.values.email,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total === 0) {
                                    return makeRequest();
                                }

                                confirmEmailSkip(
                                    [form.values.email],
                                    ({ list }) => {
                                        if (list.filter((email) => email.model).length > 0) {
                                            makeRequest();
                                        }
                                    },
                                    () => pushDanger('Geannuleerd'),
                                );
                            });
                    }

                    if (assignType.key === 'bsn') {
                        voucherService
                            .index(organization.id, {
                                type: form.values.type == 'vouchers' ? 'fund_voucher' : 'product_voucher',
                                bsn: form.values.bsn,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total === 0) {
                                    return makeRequest();
                                }

                                confirmBsnSkip(
                                    [form.values.bsn],
                                    ({ list }) => {
                                        if (list.filter((bsn) => bsn.model).length > 0) {
                                            makeRequest();
                                        }
                                    },
                                    () => pushDanger('Geannuleerd'),
                                );
                            });
                    }
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                })
                .finally(() => {
                    setProgress(100);
                });
        },
    );

    const { update: formUpdate } = form;

    const confirmEmailSkip = useCallback(
        (
            existingEmails: Array<string>,
            onConfirm: (data: { list: Array<{ value?: string; blink?: boolean; model?: boolean }> }) => void,
            onCancel = () => null,
        ) => {
            const items = existingEmails.map((email: string) => ({ value: email }));

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Dubbele e-mailadressen gedetecteerd.'}
                    hero_subtitle={[
                        `Weet u zeker dat u voor 1 e-mailadres een extra tegoed wilt aanmaken?`,
                        'Deze e-mailadressen bezitten al een tegoed van dit fonds.',
                    ]}
                    enableToggles={true}
                    items={items}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            ));
        },
        [openModal],
    );

    const confirmBsnSkip = useCallback(
        (
            existingBsn: Array<string>,
            onConfirm: (data: { list: Array<{ value?: string; blink?: boolean; model?: boolean }> }) => void,
            onCancel = () => null,
        ) => {
            const items = existingBsn.map((bsn: string) => ({ value: bsn }));

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Dubbele bsn(s) gedetecteerd.'}
                    hero_subtitle={[
                        `Weet u zeker dat u voor ${items.length} bsn(s) een extra tegoed wilt aanmaken?`,
                        'Deze burgerservicenummers bezitten al een tegoed van dit fonds.',
                    ]}
                    enableToggles={true}
                    items={items}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            ));
        },
        [openModal],
    );

    const fetchProducts = useCallback(() => {
        productService
            .listAll({
                fund_id: fund.id,
                show_all: 1,
                simplified: 1,
                per_page: 1000,
                order_by: 'name',
                order_dir: 'asc',
                free: 1,
                regular: 1,
                discount_fixed: 1,
                discount_percentage: 1,
            })
            .then((res) => {
                setProducts(
                    res.data.data.map((product) => ({
                        id: product.id,
                        price: product.price,
                        name: product.name + ' (' + product.price_locale + ') van (' + product.organization.name + ')',
                    })),
                );

                if (res.data.data.length == 0) {
                    modal.close();

                    openModal((modal) => (
                        <ModalNotification
                            modal={modal}
                            className={'modal-md'}
                            title={translate('modals.modal_product_voucher_create.errors.title.no_products')}
                            description={translate('modals.modal_product_voucher_create.errors.no_products')}
                            buttonCancel={{
                                text: translate('modals.modal_product_voucher_create.buttons.close'),
                                onClick: () => modal.close(),
                            }}
                        />
                    ));
                }
            });
    }, [fund.id, modal, openModal, productService, translate]);

    useEffect(() => {
        if (assignType.key !== 'bsn') {
            formUpdate({ bsn: null });
        }

        if (assignType.key !== 'email') {
            formUpdate({ email: null });
        }
    }, [assignType.key, formUpdate]);

    useEffect(() => {
        if (form.values.type === 'product_vouchers') {
            fetchProducts();
        }
    }, [fetchProducts, form.values.type]);

    useEffect(() => {
        if (expireAsFund) {
            formUpdate({ expire_at: fund.end_date });
        }
    }, [formUpdate, fund, expireAsFund]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">
                    {form.values.type == 'vouchers' && translate('modals.modal_voucher_create.title')}
                    {form.values.type == 'product_vouchers' && translate('modals.modal_product_voucher_create.title')}
                </div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-fields-groups">
                            <div className="modal-fields-group">
                                <div
                                    className="modal-fields-group-title"
                                    onClick={() => setShowGeneralFields(!showGeneralFields)}>
                                    <em
                                        className={classNames(
                                            'mdi',
                                            showGeneralFields ? 'mdi-menu-down' : 'mdi-menu-right',
                                        )}
                                    />
                                    Algemeen
                                </div>

                                {showGeneralFields && (
                                    <div className="modal-fields-list">
                                        <div className="form-group">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_create.labels.fund')}
                                            </div>

                                            <FormGroupInfo
                                                error={form.errors?.fund_id}
                                                info={
                                                    <TranslateHtml
                                                        i18n={'modals.modal_voucher_create.tooltips.assign_type'}
                                                    />
                                                }>
                                                <SelectControl
                                                    className={'flex-grow'}
                                                    value={fund.id}
                                                    propKey={'id'}
                                                    onChange={(fund_id: number) => {
                                                        setFund(funds.find((fund) => fund.id === fund_id));
                                                    }}
                                                    options={funds}
                                                    allowSearch={false}
                                                    optionsComponent={SelectControlOptionsFund}
                                                />
                                            </FormGroupInfo>
                                        </div>

                                        <div className="form-group">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_create.labels.credit_type')}
                                            </div>

                                            <FormGroupInfo
                                                error={form.errors?.type}
                                                info={
                                                    <TranslateHtml i18n={'modals.modal_voucher_create.tooltips.type'} />
                                                }>
                                                <SelectControl
                                                    value={form.values.type}
                                                    propKey={'key'}
                                                    onChange={(type: 'vouchers' | 'product_vouchers') => {
                                                        form.update({ type });
                                                    }}
                                                    options={creditTypes}
                                                    allowSearch={false}
                                                />
                                            </FormGroupInfo>
                                        </div>

                                        <div className="form-group">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_create.labels.amount')}
                                            </div>

                                            <input
                                                type={'number'}
                                                className="form-control"
                                                placeholder={translate('modals.modal_voucher_create.labels.amount')}
                                                value={form.values.amount || ''}
                                                step=".01"
                                                min="0.01"
                                                max={fund.limit_per_voucher}
                                                onChange={(e) => form.update({ amount: e.target.value })}
                                            />
                                            {!form.errors?.amount && (
                                                <div className="form-hint">Limiet {fund.limit_per_voucher_locale}</div>
                                            )}
                                            <FormError error={form.errors?.amount} />
                                        </div>

                                        {form.values.type == 'product_vouchers' && (
                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('modals.modal_product_voucher_create.labels.product')}
                                                </div>
                                                <SelectControl
                                                    value={form.values.product_id}
                                                    propKey={'id'}
                                                    options={products}
                                                    placeholder="Selecteer aanbod..."
                                                    allowSearch={true}
                                                    onChange={(product_id: number) => form.update({ product_id })}
                                                />
                                                <FormError error={form.errors?.product_id} />
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_create.labels.assign_by_type')}
                                            </div>
                                            <FormGroupInfo
                                                error={form.errors?.assign_by_type}
                                                info={
                                                    <TranslateHtml
                                                        i18n={'modals.modal_voucher_create.tooltips.funds'}
                                                    />
                                                }>
                                                <SelectControl
                                                    value={assignType}
                                                    propValue={'label'}
                                                    onChange={setAssignType}
                                                    options={assignTypes}
                                                    allowSearch={false}
                                                />
                                            </FormGroupInfo>
                                        </div>

                                        {fund?.backoffice?.backoffice_enabled && assignType.key !== 'bsn' && (
                                            <div className="form-group">
                                                <InfoBox type={'warning'} iconColor={'warning'}>
                                                    <p className={'text-strong'}>
                                                        Let op! De backoffice integratie stuurt mogelijk geen data
                                                    </p>
                                                    <p>
                                                        Om data te laten versturen via de backoffice integratie, is het
                                                        noodzakelijk dat de inwoner een BSN heeft geverifieerd door in
                                                        te loggen met DigiD. Bij het aanmaken van een tegoed op basis
                                                        van een activatiecode of e-mailadres, wordt deze stap
                                                        overgeslagen en zal er mogelijk geen data vanuit het systeem
                                                        worden verstuurd via de backoffice integratie.
                                                    </p>
                                                </InfoBox>
                                            </div>
                                        )}

                                        {assignType.hasInput && (
                                            <div className="form-group">
                                                <div
                                                    className={classNames(
                                                        'form-label',
                                                        'form-label-required',
                                                        ['email', 'bsn'].includes(assignType.key) &&
                                                            'form-label-required',
                                                    )}>
                                                    {assignType.inputLabel}
                                                </div>
                                                <input
                                                    className="form-control"
                                                    placeholder={assignType.inputLabel}
                                                    value={form.values[assignType.key] || ''}
                                                    onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                                />
                                                <FormError error={form.errors?.[assignType.key]} />
                                            </div>
                                        )}

                                        {fund?.backoffice?.backoffice_enabled && assignType.key === 'bsn' && (
                                            <div className="form-group">
                                                <div className="form-label">
                                                    {translate('modals.modal_voucher_create.labels.report_type')}
                                                </div>

                                                <FormGroupInfo
                                                    error={form.errors?.report_type}
                                                    info={translate(
                                                        'modals.modal_voucher_create.tooltips.report_type',
                                                    )}>
                                                    <SelectControl
                                                        value={form.values.report_type}
                                                        propKey={'key'}
                                                        propValue={'label'}
                                                        onChange={(report_type: 'user' | 'relation') => {
                                                            form.update({ report_type: report_type });
                                                        }}
                                                        options={[
                                                            {
                                                                key: 'relation',
                                                                label: translate(
                                                                    'modals.modal_voucher_create.options.report_type_relation',
                                                                ),
                                                            },
                                                            {
                                                                key: 'user',
                                                                label: translate(
                                                                    'modals.modal_voucher_create.options.report_type_user_bsn',
                                                                ),
                                                            },
                                                        ]}
                                                        allowSearch={false}
                                                    />
                                                </FormGroupInfo>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <div className="form-label">
                                                {translate('modals.modal_voucher_create.labels.client_uid')}
                                            </div>

                                            <input
                                                className="form-control"
                                                placeholder={translate('modals.modal_voucher_create.labels.client_uid')}
                                                value={form.values.client_uid || ''}
                                                onChange={(e) => form.update({ client_uid: e.target.value })}
                                            />
                                            <FormError error={form.errors?.client_uid} />
                                        </div>

                                        <div className="row">
                                            <div className="col col-xs-12 col-sm-6">
                                                <FormGroup
                                                    label={'Instelling voor geldigheid'}
                                                    info={
                                                        <Fragment>
                                                            Kies of het tegoed een specifieke einddatum heeft of dat het
                                                            tegoed een verloopdatum heeft die gelijk staat aan de
                                                            einddatum van de regeling.
                                                        </Fragment>
                                                    }
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            propKey={'value'}
                                                            propValue={'label'}
                                                            options={[
                                                                {
                                                                    value: true,
                                                                    label: 'Gebruik de standaard verloopdatum',
                                                                },
                                                                { value: false, label: 'Stel een verloopdatum in' },
                                                            ]}
                                                            value={expireAsFund}
                                                            onChange={(value: boolean) => setExpireAsFund(value)}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="col col-xs-12 col-sm-6">
                                                <FormGroup
                                                    label={translate('modals.modal_voucher_create.labels.expire_at')}
                                                    error={form.errors.expire_at}
                                                    info={
                                                        <Fragment>
                                                            De laatste dag waarop het tegoed geldig is. Daarna verloopt
                                                            het tegoed en kan deze niet meer worden gebruikt.
                                                        </Fragment>
                                                    }
                                                    input={(id) =>
                                                        expireAsFund ? (
                                                            <input
                                                                id={id}
                                                                className="form-control"
                                                                value={form.values.expire_at}
                                                                disabled={true}
                                                            />
                                                        ) : (
                                                            <DatePickerControl
                                                                id={id}
                                                                value={dateParse(form.values.expire_at)}
                                                                dateMin={dateMinLimit}
                                                                dateMax={dateParse(fund.end_date)}
                                                                placeholder={translate('dd-MM-yyyy')}
                                                                onChange={(expire_at: Date) => {
                                                                    form.update({ expire_at: dateFormat(expire_at) });
                                                                }}
                                                            />
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {fund?.show_requester_limits && (
                                            <div className="form-group">
                                                <div className="form-label form-label-required">
                                                    {translate('modals.modal_voucher_create.labels.limit_multiplier')}
                                                </div>

                                                <input
                                                    type={'number'}
                                                    className="form-control"
                                                    placeholder={translate(
                                                        'modals.modal_voucher_create.labels.limit_multiplier',
                                                    )}
                                                    value={form.values.limit_multiplier}
                                                    step=".01"
                                                    min="0.01"
                                                    onChange={(e) => {
                                                        form.update({ limit_multiplier: parseInt(e.target.value) });
                                                    }}
                                                />

                                                <FormError error={form.errors?.limit_multiplier} />
                                            </div>
                                        )}

                                        {form.values.type == 'product_vouchers' && (
                                            <FormGroup
                                                className="form-group"
                                                error={form.errors.notify_provider}
                                                label={translate('modals.modal_voucher_create.labels.notify_provider')}
                                                input={(id) => (
                                                    <SelectControl
                                                        id={id}
                                                        value={form.values.notify_provider}
                                                        propKey={'key'}
                                                        propValue={'label'}
                                                        onChange={(notify_provider: boolean) => {
                                                            form.update({ notify_provider });
                                                        }}
                                                        options={[
                                                            { key: true, label: 'Ja' },
                                                            { key: false, label: 'Nee' },
                                                        ]}
                                                        allowSearch={false}
                                                    />
                                                )}
                                            />
                                        )}

                                        <div className="form-group">
                                            <div className="form-label">
                                                {translate('modals.modal_voucher_create.labels.note')}
                                            </div>
                                            <textarea
                                                className="form-control r-n"
                                                placeholder={translate('modals.modal_voucher_create.labels.note')}
                                                value={form.values.note || ''}
                                                onChange={(e) => form.update({ note: e.target.value })}
                                            />
                                            <FormError error={form.errors?.note} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {fund.allow_voucher_records && (
                                <div className="modal-fields-group">
                                    <div
                                        className="modal-fields-group-title"
                                        onClick={() => setShowRecordFields(!showRecordFields)}>
                                        <em
                                            className={classNames(
                                                'mdi',
                                                showRecordFields ? 'mdi-menu-down' : 'mdi-menu-right',
                                            )}
                                        />
                                        Persoonsgegevens
                                    </div>

                                    {showRecordFields && (
                                        <div className="modal-fields-list">
                                            <VoucherRecordsEditor
                                                records={form.values.records}
                                                setRecords={(records) => formUpdate({ records })}
                                                errors={form.errors}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <div className="form-label" />
                            <div className="block block-info">
                                <em className="mdi mdi-information block-info-icon" />
                                {translate('modals.modal_voucher_create.info')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_create.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary">
                        {translate('modals.modal_voucher_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
