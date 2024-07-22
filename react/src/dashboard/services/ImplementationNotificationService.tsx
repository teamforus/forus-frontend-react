import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import SystemNotification from '../props/models/SystemNotification';
import NotificationTemplate from '../props/models/NotificationTemplate';
import { QRCodeSVG } from 'qrcode.react';
import variables from './constants/notification_templates/variables.json';
import React from 'react';
import { useMarkdownService } from './MarkdownService';
import { renderToString } from 'react-dom/server';
import Implementation from '../props/models/Implementation';

export class ImplementationNotificationService<T = SystemNotification> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Fetch list
     */
    public list(organizationId: number, id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${id}/system-notifications`, data);
    }

    /**
     * Fetch by id
     */
    public read(
        organizationId: number,
        implementationId: number,
        id: number,
        query?: object,
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/system-notifications/${id}`,
            query,
        );
    }

    /**
     * Update by id
     */
    public update(organizationId: number, id: number, page_id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/implementations/${id}/system-notifications/${page_id}`,
            data,
        );
    }

    public notificationHasDisabledChannels(notification: SystemNotification) {
        return (
            [
                notification.channels.includes('database') ? notification.enable_database : true,
                notification.channels.includes('push') ? notification.enable_push : true,
                notification.channels.includes('mail') ? notification.enable_mail : true,
            ].filter((item) => !item).length > 0
        );
    }

    public varsToLabels(template: string, varsMap = null) {
        const vars = varsMap ? varsMap : variables;

        return this.replaceTemplateValues(template, vars, true);
    }

    public labelsToVars(template: string, varsMap = null) {
        const vars = varsMap ? varsMap : variables;

        return this.replaceTemplateValues(template.replace(/\\/g, ''), vars, false);
    }

    public contentToPreview(content: string, variableValues = {}) {
        return this.replaceTemplateValues(
            content,
            Object.keys(variableValues).reduce((vars, key) => {
                return { ...vars, [variables[`:${key}`]]: variableValues[key] };
            }, {}),
        );
    }

    public makeCustomNotification = (title: string, template_html: string) => {
        const markdownService = useMarkdownService();
        template_html = this.varsToLabels(template_html);

        return {
            title: title,
            editable: true,
            variables: ['fund_name', 'sponsor_name', 'webshop_button', 'email_logo', 'email_signature'],
            templates_default: [
                {
                    type: 'mail',
                    formal: false,
                    title: '[fonds_naam] - Onderwerp',
                    content: markdownService.toMarkdown(template_html),
                    content_html: template_html,
                },
            ],
        };
    };

    public isMailOnlyVariable(variable: string) {
        const mailOnlyVars = [':qr_token', ':email_logo', ':email_signature'];
        const mailOnlyVarEndings = ['_link', '_link_clarification', '_button'];

        return (
            mailOnlyVars.includes(variable) ||
            mailOnlyVarEndings.filter((ending) => variable.endsWith(ending)).length > 0
        );
    }

    public replaceTemplateValues(template: string, vars: { [key: string]: string }, byKey = true) {
        const varsKeys = Object.keys(vars).sort((a, b) => b.length - a.length);

        const data = varsKeys.reduce((value, key) => {
            return [...value, byKey ? { from: key, to: [vars[key]] } : { from: [vars[key]], to: key }];
        }, []);

        return data.reduce((template, value) => template.replaceAll(value.from, value.to), template);
    }

    public labelsToBlocks(template: string, implementation: Implementation = null) {
        const { email_signature, email_signature_default } = implementation;
        const { email_color, email_color_default } = implementation;
        const { email_logo, email_logo_default } = implementation;

        const logo = implementation ? (email_logo ? email_logo : email_logo_default) : null;
        const color = implementation ? (email_color ? email_color : email_color_default) : null;
        const signature = implementation ? (email_signature ? email_signature : email_signature_default) : null;

        return template
            .replaceAll(
                '[webshop_button]',
                [
                    `<div class="text-center">`,
                    `<span class="mail_btn" style="${
                        color ? `background-color: ${color}` : ''
                    };">Ga naar webshop</span>`,
                    `</div>`,
                ].join(''),
            )
            .replaceAll(
                '[email_logo]',
                renderToString(
                    <img
                        src={logo?.sizes?.large || ''}
                        alt={'email_logo'}
                        style={{ width: '300px', display: 'block', margin: '0 auto' }}
                    />,
                ),
            )
            .replaceAll('[email_signature]', signature)
            .replaceAll(
                '[qr_code]',
                renderToString(
                    <QRCodeSVG
                        value={JSON.stringify({ type: 'voucher', value: '0xbfeb14d52b8f8fb8b95d377a21c2260f33bf2362' })}
                        level={'M'}
                        size={300}
                    />,
                ),
            );
    }

    public templatesToFront(templates: Array<NotificationTemplate>) {
        return templates.map((template) => {
            const title = this.varsToLabels(template.title);
            const content = this.varsToLabels(template.content);
            const content_html = template.content_html ? this.varsToLabels(template.content_html) : null;

            return { ...template, title, content, content_html };
        });
    }

    public notificationToStateLabel(notification: SystemNotification) {
        const notificationStateLabel = {
            inactive: `Inactief`,
            active: 'Actief',
            active_partly: 'Gedeeltelijk',
        };
        const hasDisabledChannels = this.notificationHasDisabledChannels(notification);

        const state = notification.enable_all ? (hasDisabledChannels ? 'active_partly' : 'active') : 'inactive';
        const stateLabel = notificationStateLabel[state];

        return { state, stateLabel };
    }
}

export default function useImplementationNotificationService(): ImplementationNotificationService {
    return useState(new ImplementationNotificationService())[0];
}
