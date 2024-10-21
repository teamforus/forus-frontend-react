import React, { Fragment, useEffect, useState } from 'react';
import useSetProgress from '../../../../hooks/useSetProgress';
import FormError from '../../../elements/forms/errors/FormError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import useTranslate from '../../../../hooks/useTranslate';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import Fund from '../../../../props/models/Fund';
import { ResponseError } from '../../../../props/ApiResponses';
import usePushDanger from '../../../../hooks/usePushDanger';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import classNames from 'classnames';

export default function OrganizationsFundsShowFundRequestConfigCard({
    fund,
    setFund,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const fundService = useFundService();

    const [collapsed, setCollapsed] = useState(true);

    const form = useFormBuilder<{
        help_title: string;
        help_block_text: string;
        help_button_text: string;
        help_show_email: boolean;
        help_show_phone: boolean;
        help_show_website: boolean;
        help_show_chat: boolean;
        help_email: string;
        help_phone: string;
        help_website: string;
        help_chat: string;
        help_description: string;
        help_description_html: string;
        help_enabled: boolean;
    }>(
        {
            help_title: '',
            help_block_text: '',
            help_button_text: '',
            help_show_email: false,
            help_show_phone: false,
            help_show_website: false,
            help_show_chat: false,
            help_email: '',
            help_phone: '',
            help_website: '',
            help_chat: '',
            help_description: '',
            help_description_html: '',
            help_enabled: false,
        },
        (values) => {
            setProgress(0);

            console.log('asd-0');
            fundService
                .update(fund.organization.id, fund.id, values)
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    setFund(fund);
                    form.setErrors({});
                })
                .catch((err: ResponseError) => {
                    pushDanger('Mislukt!', err.data?.message || 'Onbekende foutmelding.');
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: updateForm } = form;

    useEffect(() => {
        if (fund) {
            updateForm({
                help_title: fund.help_title,
                help_block_text: fund.help_block_text,
                help_button_text: fund.help_button_text,
                help_show_email: fund.help_show_email,
                help_show_phone: fund.help_show_phone,
                help_show_website: fund.help_show_website,
                help_show_chat: fund.help_show_chat,
                help_email: fund.help_email,
                help_phone: fund.help_phone,
                help_website: fund.help_website,
                help_chat: fund.help_chat,
                help_description: fund.help_description,
                help_description_html: fund.help_description_html,
                help_enabled: fund.help_enabled,
            });
        }
    }, [updateForm, fund]);

    return (
        <form className="block block-collapsable form" onSubmit={form.submit}>
            <div className="collapsable-header" onClick={() => setCollapsed(!collapsed)}>
                <em
                    className={classNames(
                        'collapsable-header-icon',
                        'mdi',
                        collapsed ? 'mdi-menu-right' : 'mdi-menu-down',
                    )}
                />

                <div className="collapsable-header-title">Instellingen aanvraagformulier</div>

                {!collapsed ? (
                    <button
                        className="button button-default button-sm"
                        type="button"
                        onClick={() => setCollapsed(true)}>
                        <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                        Inklappen
                    </button>
                ) : (
                    <button
                        className="button button-primary button-sm"
                        type="button"
                        onClick={() => setCollapsed(false)}>
                        <em className="mdi mdi-arrow-expand-vertical icon-start" />
                        Uitklappen
                    </button>
                )}
            </div>

            {!collapsed && (
                <Fragment>
                    <div className="collapsable-body">
                        <div className="form-group">
                            <div className="form-title">
                                {translate('fund_request_configurations.titles.main_information')}
                            </div>
                        </div>

                        <div className="form-group">
                            <CheckboxControl
                                id="enable_help_modal"
                                title={translate('fund_request_configurations.labels.enable_help_modal')}
                                checked={!!form.values.help_enabled}
                                onChange={(e) => form.update({ help_enabled: e.target.checked })}
                            />
                            <FormError error={form.errors?.help_enabled} />
                        </div>

                        <div className="form-group row">
                            <div className="col col-xs-12 col-lg-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.banner_text')}
                                    </label>

                                    <FormGroupInfo
                                        info={
                                            <p>
                                                Banner tekst Een korte tekst onder het aanvraagformulier over de hulp
                                                optie tijdens het invullen van het aanvraagformulier. Deze tekst wordt
                                                naast de hulp knop getoond.
                                            </p>
                                        }>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.values.help_block_text ?? ''}
                                            placeholder={translate(
                                                'fund_request_configurations.labels.banner_text_placeholder',
                                            )}
                                            onChange={(e) => form.update({ help_block_text: e.target.value })}
                                        />
                                    </FormGroupInfo>
                                    <FormError error={form.errors?.help_block_text} />
                                </div>
                            </div>

                            <div className="col col-xs-12 col-lg-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.button_text')}
                                    </label>

                                    <FormGroupInfo
                                        info={
                                            <p>
                                                Knop tekst De tekst van de knop onder het aanvraagformulier. Door te
                                                klikken op deze knop opent er meer informatie (en contactinformatie)
                                                over de geboden ondersteuning.
                                            </p>
                                        }>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.values.help_button_text ?? ''}
                                            placeholder={translate(
                                                'fund_request_configurations.labels.button_text_placeholder',
                                            )}
                                            onChange={(e) => form.update({ help_button_text: e.target.value })}
                                        />
                                    </FormGroupInfo>

                                    <FormError error={form.errors?.help_button_text} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {translate('fund_request_configurations.labels.title')}
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.values.help_title ?? ''}
                                placeholder={translate('fund_request_configurations.labels.title_placeholder')}
                                onChange={(e) => form.update({ help_title: e.target.value })}
                            />

                            <FormError error={form.errors?.help_title} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {translate('fund_request_configurations.labels.description')}
                            </label>
                            <MarkdownEditor
                                value={form.values.help_description_html}
                                onChange={(description) => form.update({ help_description: description })}
                                extendedOptions={true}
                                placeholder={translate('fund_request_configurations.labels.description_placeholder')}
                            />
                            <div className="form-hint">Max. 1000 tekens</div>
                            <FormError error={form.errors?.help_description} />
                        </div>

                        <div className="form-group">
                            <div className="form-title">
                                {translate('fund_request_configurations.titles.contact_details')}
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className="col col-xs-12 col-lg-6">
                                <div className="form-group">
                                    <CheckboxControl
                                        id="show_email"
                                        narrow={true}
                                        title={translate('fund_request_configurations.labels.show_email')}
                                        checked={!!form.values.help_show_email}
                                        onChange={(e) => form.update({ help_show_email: e.target.checked })}
                                    />

                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.email')}
                                    </label>

                                    <input
                                        type="text"
                                        disabled={!form.values.help_show_email}
                                        className="form-control"
                                        value={form.values.help_email ?? ''}
                                        placeholder={translate('fund_request_configurations.labels.email_placeholder')}
                                        onChange={(e) => form.update({ help_email: e.target.value })}
                                    />

                                    <FormError error={form.errors?.help_show_email} />
                                    <FormError error={form.errors?.help_email} />
                                </div>

                                <div className="form-group">
                                    <CheckboxControl
                                        id="show_website"
                                        narrow={true}
                                        title={translate('fund_request_configurations.labels.show_website')}
                                        checked={!!form.values.help_show_website}
                                        onChange={(e) => form.update({ help_show_website: e.target.checked })}
                                    />
                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.website')}
                                    </label>

                                    <input
                                        type="text"
                                        disabled={!form.values.help_show_website}
                                        className="form-control"
                                        value={form.values.help_website ?? ''}
                                        placeholder={translate(
                                            'fund_request_configurations.labels.website_placeholder',
                                        )}
                                        onChange={(e) => form.update({ help_website: e.target.value })}
                                    />

                                    <FormError error={form.errors?.help_show_website} />
                                    <FormError error={form.errors?.help_website} />
                                </div>
                            </div>

                            <div className="col col-xs-12 col-lg-6">
                                <div className="form-group">
                                    <CheckboxControl
                                        id="show_phone"
                                        narrow={true}
                                        title={translate('fund_request_configurations.labels.show_phone')}
                                        checked={!!form.values.help_show_phone}
                                        onChange={(e) => form.update({ help_show_phone: e.target.checked })}
                                    />
                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.phone')}
                                    </label>

                                    <input
                                        type="text"
                                        disabled={!form.values.help_show_phone}
                                        className="form-control"
                                        value={form.values.help_phone ?? ''}
                                        placeholder={translate('fund_request_configurations.labels.phone_placeholder')}
                                        onChange={(e) => form.update({ help_phone: e.target.value })}
                                    />

                                    <FormError error={form.errors?.help_show_phone} />
                                    <FormError error={form.errors?.help_phone} />
                                </div>

                                <div className="form-group">
                                    <CheckboxControl
                                        id="show_chat"
                                        narrow={true}
                                        title={translate('fund_request_configurations.labels.show_chat')}
                                        checked={!!form.values.help_show_chat}
                                        onChange={(e) => form.update({ help_show_chat: e.target.checked })}
                                    />

                                    <label className="form-label">
                                        {translate('fund_request_configurations.labels.chat')}
                                    </label>

                                    <input
                                        type="text"
                                        disabled={!form.values.help_show_chat}
                                        className="form-control"
                                        value={form.values.help_chat ?? ''}
                                        placeholder={translate('fund_request_configurations.labels.chat_placeholder')}
                                        onChange={(e) => form.update({ help_chat: e.target.value })}
                                    />

                                    <FormError error={form.errors?.help_show_chat} />
                                    <FormError error={form.errors?.help_chat} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="collapsable-footer flex flex-end">
                        <div className="button-group">
                            <button
                                type={'button'}
                                className="button button-default"
                                onClick={() => {
                                    console.log('asd');
                                    form.reset();
                                    setCollapsed(true);
                                }}>
                                {translate('fund_request_configurations.buttons.cancel')}
                            </button>

                            <button className="button button-primary" type="submit">
                                {translate('fund_request_configurations.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </Fragment>
            )}
        </form>
    );
}
