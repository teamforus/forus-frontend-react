import React, { useEffect } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { PrintableState } from '../../../dashboard/modules/printable/context/PrintableContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import QrCode from '../../../dashboard/components/elements/qr-code/QrCode';
import Fund from '../../../dashboard/props/models/Fund';
import OrganizationBasic from '../../../dashboard/props/models/OrganizationBasic';

export default function VoucherQrCodePrintable({
    fund,
    voucher,
    assetUrl,
    printable,
    webshopUrl,
    organization,
    showConditions = false,
}: {
    fund?: Partial<Fund>;
    voucher: Voucher;
    assetUrl: (uri: string) => string;
    printable: PrintableState;
    webshopUrl?: string;
    organization: OrganizationBasic;
    showConditions?: boolean;
}) {
    const translate = useTranslate();

    const voucherType = voucher.product ? 'product' : 'budget';
    const printableTitle = voucher.product ? voucher.product.name : voucher.fund.name;

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            window.print();
            printable.close();
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [printable]);

    return (
        <div className="printable printable-voucher-qr_code">
            <div className="printable-main-info">
                <div className="printable-usage-info">
                    <span>{translate(`voucher_printable.${voucherType}_voucher.labels.use_for`)}</span>
                    <br />
                    <strong>{voucher.last_active_day_locale}</strong>
                </div>
                <div className="printable-logo">
                    <img src={assetUrl('/assets/img/implementation-logo.png')} alt={''} />
                </div>
                <QrCode value={JSON.stringify({ type: 'voucher', value: voucher.address })} />
                <div className="printable-title">{printableTitle}</div>
                <div className="printable-description">
                    {translate(`voucher_printable.${voucherType}_voucher.labels.description`, { printableTitle })}
                </div>
            </div>
            <div className="printable-additional-info">
                {showConditions && fund && !voucher?.product && (
                    <div className="printable-condition">
                        {translate(
                            `voucher_printable.budget_voucher.labels.${fund?.implementation?.key}.condition`,
                            null,
                            'voucher_printable.budget_voucher.labels.condition',
                        )}
                    </div>
                )}
                <div className="notice">{translate('voucher_printable.default.labels.purchases_notice')}</div>
                <div className="description">
                    {translate(`voucher_printable.${voucherType}_voucher.labels.show_to`)}
                </div>
                <div className="reference">{voucherType != 'product' ? webshopUrl : organization?.name}</div>
            </div>
            <div className="printable-organization-info">
                <div className="contact">
                    <span>
                        {translate('voucher_printable.default.labels.contact.have_questions', { printableTitle })}
                    </span>
                    <br />
                    <span>{translate(`voucher_printable.${voucherType}_voucher.labels.contact_us`)}</span>
                </div>
                <span>{translate('voucher_printable.default.labels.contact.phone')}: </span>
                <strong>{organization.phone}</strong>
                <br />
                <span>{translate('voucher_printable.default.labels.contact.email')}: </span>
                <strong>{organization.email}</strong>
                <div className="general-logo">
                    <img src={assetUrl('/assets/img/general-logo.svg')} alt={''} />
                </div>
            </div>
        </div>
    );
}
