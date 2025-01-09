import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useEnvData from '../../../hooks/useEnvData';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import Reimbursement from '../../../props/models/Reimbursement';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useReimbursementService } from '../../../services/ReimbursementService';
import { useParams } from 'react-router-dom';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import FileUploader from '../../elements/file-uploader/FileUploader';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../modules/state_router/Router';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import BlockVoucherRecords from '../../elements/block-voucher-records/BlockVoucherRecords';
import File from '../../../../dashboard/props/models/File';
import ModalReimbursementConfirm from '../../modals/ModalReimbursementConfirm';
import Fund from '../../../props/models/Fund';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import SelectControlOptionsVouchers from '../../elements/select-control/templates/SelectControlOptionsVouchers';
import Tooltip from '../../elements/tooltip/Tooltip';
import useSetTitle from '../../../hooks/useSetTitle';
import useFetchAuthIdentity from '../../../hooks/useFetchAuthIdentity';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';

export default function ReimbursementsEdit() {
    const { id, voucher_id } = useParams();
    const envData = useEnvData();
    const auth2FAState = useAuthIdentity2FAState();
    const authIdentity = useAuthIdentity();

    const openModal = useOpenModal();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const voucherService = useVoucherService();
    const reimbursementService = useReimbursementService();

    const [files, setFiles] = useState<Array<File>>([]);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [reimbursement, setReimbursement] = useState<Reimbursement>(null);
    const [skipEmail, setSkipEmail] = useState(false);
    const [generalErrorMsg, setGeneralErrorMsg] = useState<string>(null);

    const form = useFormBuilder<
        {
            title: string;
            description: string;
            amount: string;
            voucher_id: number;
            iban: string;
            iban_name: string;
        },
        'pending' | 'draft'
    >(
        {
            title: '',
            description: '',
            amount: '',
            voucher_id: null,
            iban: '',
            iban_name: '',
        },
        (values, _, state) => {
            setProgress(0);

            const data = {
                ...values,
                state: state,
                files: files.map((file) => file.uid),
            };

            if (typeof data.iban === 'string') {
                data.iban = data.iban.replace(/\s/g, '');
            }

            const promise = !reimbursement
                ? reimbursementService.store(data)
                : reimbursementService.update(reimbursement.id, data);

            promise
                .then((res) => {
                    form.errors = null;

                    if (res.data.data.state === 'pending') {
                        pushSuccess('Gelukt!', 'Declaratie verzoek is ingediend voor beoordeling.');
                    } else {
                        pushSuccess('Gelukt!', 'Declaratie verzoek is opgeslagen.');
                    }

                    navigateState('reimbursements');
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors || null);
                    setFiles(setFilesErrors(files, form.errors));
                    pushDanger('Error!', err.data.message);
                    setGeneralErrorMsg(err.data.message);
                })
                .finally(() => setProgress(100));
        },
    );

    const { update: formUpdate } = form;

    const fetchVouchers = useCallback(() => {
        voucherService
            .list({ allow_reimbursements: 1, implementation_key: envData.client_key, per_page: 100 })
            .then((res) => setVouchers(res.data.data.map((voucher) => voucher)));
    }, [voucherService, envData.client_key]);

    const fetchReimbursement = useCallback(() => {
        if (!id) {
            return;
        }

        setProgress(0);

        reimbursementService
            .read(parseInt(id))
            .then((res) => setReimbursement(res.data.data))
            .finally(() => setProgress(100));
    }, [id, setProgress, reimbursementService]);

    const setFilesErrors = useCallback((files, errors) => {
        const filesList = [...files].map((file) => ({ ...file }));
        const filesKeys = Object.keys(errors).filter((key) => key.startsWith('files.'));

        filesKeys.forEach(
            (value, index) => (filesList[index].error = errors[`files.${index}`] || value),
            [...Array(filesList.length).keys()].map(() => null),
        );

        return filesList;
    }, []);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        fetchReimbursement();
    }, [fetchReimbursement]);

    useEffect(() => {
        fetchAuthIdentity().then();
    }, [fetchAuthIdentity]);

    useEffect(() => {
        if ((reimbursement || !id) && vouchers) {
            const { title = '', description = '' } = reimbursement || {};
            const { amount = '', iban = '', iban_name = '' } = reimbursement || {};

            formUpdate({
                ...{ title, description, iban, iban_name, amount },
                voucher_id:
                    reimbursement?.voucher_id ||
                    (voucher_id ? parseInt(voucher_id) : null) ||
                    vouchers[0]?.id ||
                    undefined,
            });

            setFiles(reimbursement?.files || []);
        }
    }, [id, formUpdate, vouchers, reimbursement, voucher_id]);

    const selectedVoucher = useMemo(() => {
        return vouchers?.find((voucher) => voucher.id == form.values.voucher_id);
    }, [vouchers, form.values.voucher_id]);

    const submitAvailable = useMemo(() => {
        return (
            [
                form?.isLocked,
                !form?.values?.amount,
                !form?.values?.title,
                !form?.values?.iban,
                !form?.values?.iban_name,
                !files.filter((file) => file?.uid)?.length,
            ].filter((invalid) => invalid).length === 0
        );
    }, [files, form?.isLocked, form?.values?.amount, form?.values?.iban, form?.values?.iban_name, form?.values?.title]);

    const submit = useCallback(
        (submitToReview = false) => {
            if (!submitToReview) {
                return form.submit(null, 'draft');
            }

            openModal((modal) => (
                <ModalReimbursementConfirm
                    modal={modal}
                    onConfirm={() => form.submit(null, 'pending')}
                    reimbursement={{
                        ...form.values,
                        files: files.map((file) => file),
                        fund: vouchers.find((voucher) => voucher.id == form.values.voucher_id)?.fund as Fund,
                    }}
                />
            ));
        },
        [files, form, openModal, vouchers],
    );

    useEffect(() => {
        if (auth2FAState?.restrictions?.reimbursements?.restricted) {
            return navigateState('reimbursements');
        }
    }, [auth2FAState?.restrictions?.reimbursements?.restricted, navigateState]);

    useEffect(() => {
        if (reimbursement?.code) {
            setTitle(translate('page_state_titles.reimbursement-edit', { code: `#${reimbursement?.code || ''}` }));
        }
    }, [reimbursement?.code, setTitle, translate]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('reimbursements.breadcrumbs.home'), state: 'home' },
                { name: translate('reimbursements.breadcrumbs.reimbursements'), state: 'reimbursements' },
                { name: translate('reimbursements.breadcrumbs.reimbursement') },
            ]}
            profileHeader={
                !auth2FAState?.restrictions?.reimbursements?.restricted &&
                vouchers &&
                (!id || reimbursement) && (
                    <div className="profile-content-header">
                        <h1 className="profile-content-title">
                            {reimbursement
                                ? translate('reimbursements.title_edit', { code: reimbursement.code })
                                : translate('reimbursements.title_create')}
                        </h1>
                    </div>
                )
            }
            contentDusk={'reimbursementEditContent'}>
            {!auth2FAState?.restrictions?.reimbursements?.restricted && vouchers && (!id || reimbursement) && (
                <Fragment>
                    {!reimbursement && !authIdentity?.email && !skipEmail && (
                        <div className="card" data-dusk="reimbursementNoEmail">
                            <div className="card-section">
                                <div className="card-title">
                                    <strong>{translate('reimbursements.no_email.title')}</strong>
                                </div>
                                <div className="card-text">
                                    <TranslateHtml i18n={'reimbursements.no_email.description'} />
                                </div>
                                <div className="card-text">
                                    <StateNavLink
                                        name={'identity-emails'}
                                        className="button button-primary button-sm"
                                        dataDusk="reimbursementNoEmailAddBtn">
                                        {translate('reimbursements.no_email.add_email')}
                                    </StateNavLink>
                                    <div
                                        className="button button-text button-sm"
                                        data-dusk="reimbursementNoEmailSkipBtn"
                                        onClick={() => setSkipEmail(true)}>
                                        {translate('reimbursements.no_email.skip_email')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(reimbursement || authIdentity?.email || skipEmail) && (
                        <div className="card" data-dusk="reimbursementForm">
                            <form
                                className="form form-compact form-compact-flat"
                                onSubmit={(e) => {
                                    e?.preventDefault();
                                    submit(true);
                                }}>
                                {generalErrorMsg && (
                                    <div className="card-section text-center">
                                        <FormError error={generalErrorMsg} className={'text-semibold'} />
                                    </div>
                                )}

                                <div className="card-section">
                                    <FileUploader
                                        type="reimbursement_proof"
                                        files={reimbursement?.files}
                                        title={translate('reimbursements.form.file_upload_title')}
                                        acceptedFiles={['.pdf', '.png', '.jpg', '.jpeg']}
                                        cropMedia={true}
                                        multiple={true}
                                        isRequired={true}
                                        onFilesChange={({ files }) => setFiles(files)}
                                    />
                                    {form.errors.files && (
                                        <div className="text-center">
                                            <br />
                                            <FormError error={form.errors.files} />
                                        </div>
                                    )}
                                </div>

                                <div className="card-section">
                                    <div className="row">
                                        <div className="col col-xs-12 col-md-10">
                                            <div className="form-group form-group-inline">
                                                <label className="form-label" htmlFor="voucher_id">
                                                    <div className="flex-inline flex-gap-sm">
                                                        <div className="flex">
                                                            {translate('reimbursements.form.voucher')}
                                                        </div>
                                                        <div className="flex-inline flex-center flex-vertical">
                                                            <Tooltip
                                                                className={'text-left'}
                                                                text={translate('reimbursements.form.voucher_tooltip')}
                                                            />
                                                        </div>
                                                    </div>
                                                </label>
                                                <div className="form-offset">
                                                    <SelectControl
                                                        id="voucher_id"
                                                        propValue="address"
                                                        propKey="id"
                                                        allowSearch={false}
                                                        value={form.values.voucher_id ?? ''}
                                                        onChange={(voucher_id?: number) => form.update({ voucher_id })}
                                                        options={vouchers}
                                                        optionsComponent={SelectControlOptionsVouchers}
                                                    />
                                                    <FormError error={form.errors.voucher_id} />
                                                    {selectedVoucher?.records?.length > 0 && (
                                                        <BlockVoucherRecords
                                                            toggle={true}
                                                            compact={true}
                                                            voucher={selectedVoucher}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-section">
                                    <div className="row">
                                        <div className="col col-xs-12 col-md-10">
                                            <div className="form-group form-group-inline">
                                                <label className="form-label form-label-required" htmlFor="title">
                                                    {translate('reimbursements.form.title')}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    type="text"
                                                    value={form.values.title || ''}
                                                    onChange={(e) => form.update({ title: e.target.value })}
                                                    maxLength={200}
                                                />
                                                <FormError error={form.errors.title} />
                                            </div>
                                            <div className="form-group form-group-inline">
                                                <label className="form-label form-label-required" htmlFor="amount">
                                                    {translate('reimbursements.form.amount')}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="amount"
                                                    type="number"
                                                    name="amount"
                                                    step=".01"
                                                    min="0.01"
                                                    value={form.values.amount ?? ''}
                                                    onChange={(e) => form.update({ amount: e.target.value })}
                                                />
                                                <FormError error={form.errors.amount} />
                                            </div>
                                            <div className="form-group form-group-inline">
                                                <label className="form-label" htmlFor="description">
                                                    {translate('reimbursements.form.description')}
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    id="description"
                                                    value={form.values.description || ''}
                                                    onChange={(e) => form.update({ description: e.target.value })}
                                                    name="description"
                                                    style={{ resize: 'vertical' }}
                                                    maxLength={2000}
                                                />
                                                <FormError error={form.errors.description} />
                                            </div>
                                            <div className="form-group form-group-inline">
                                                <label className="form-label form-label-required" htmlFor="iban">
                                                    <div className="flex-inline">
                                                        <div className="flex">
                                                            {translate('reimbursements.form.iban')}
                                                        </div>
                                                        <div className="flex-inline flex-center flex-vertical">
                                                            <Tooltip
                                                                className={'text-left'}
                                                                text={translate('reimbursements.form.iban_name')}
                                                            />
                                                        </div>
                                                    </div>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="iban"
                                                    type="text"
                                                    name="iban"
                                                    value={form.values.iban || ''}
                                                    onChange={(e) => form.update({ iban: e.target.value })}
                                                    maxLength={34}
                                                />
                                                <FormError error={form.errors.iban} />
                                            </div>
                                            <div className="form-group form-group-inline">
                                                <label className="form-label form-label-required" htmlFor="iban_name">
                                                    {translate('reimbursements.form.iban_name')}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="iban_name"
                                                    type="text"
                                                    name="iban_name"
                                                    value={form.values.iban_name || ''}
                                                    onChange={(e) => form.update({ iban_name: e.target.value })}
                                                    maxLength={45}
                                                />
                                                <FormError error={form.errors.iban_name} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-section">
                                    <div className="flex flex-horizontal">
                                        <div className="flex hide-sm">
                                            <StateNavLink
                                                name={'reimbursements'}
                                                className="button button-light button-sm"
                                                data-dusk="reimbursementFormCancel"
                                                disabled={form.isLocked}>
                                                {translate('reimbursements.form_buttons.cancel')}
                                            </StateNavLink>
                                        </div>
                                        <div className="flex flex-grow flex-end">
                                            <div className="button-group">
                                                <button
                                                    className="button button-primary-outline button-sm"
                                                    type="button"
                                                    data-dusk="reimbursementFormSave"
                                                    disabled={form.isLocked}
                                                    onClick={() => submit()}>
                                                    {translate('reimbursements.form_buttons.save_for_later')}
                                                </button>
                                                <button
                                                    className="button button-primary button-sm"
                                                    type="submit"
                                                    disabled={!submitAvailable}
                                                    data-dusk="reimbursementFormSubmit">
                                                    {translate('reimbursements.form_buttons.submit')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
