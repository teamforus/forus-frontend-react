import React, { Fragment } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import { strLimit } from '../../../../../dashboard/helpers/string';
import QrCode from '../../../../../dashboard/components/elements/qr-code/QrCode';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import VoucherActions from '../elements/VoucherActions';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { makeQrCodeContent } from '../../../../../dashboard/helpers/utils';

export default function VoucherDetailsInternalCard({
    voucher,
    setVoucher,
    fetchVoucher,
}: {
    voucher: Voucher;
    setVoucher: React.Dispatch<React.SetStateAction<Voucher>>;
    fetchVoucher: () => void;
}) {
    const voucherCard = useVoucherData(voucher);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="block block-voucher">
            <h1 className="sr-only">Jouw tegoed</h1>
            <div className="base-card base-card-voucher">
                <div className="card-inner">
                    <div className="card-body">
                        <div className="card-photo">
                            <img className="voucher-img" src={voucherCard.thumbnail} alt={''} />
                        </div>
                        <div className="card-section">
                            <h2 className="card-title" data-dusk="voucherTitle">
                                {strLimit(voucherCard.title, 40)}
                            </h2>

                            {!voucherCard.product ? (
                                <div className="card-subtitle">{voucherCard.fund.organization.name}</div>
                            ) : (
                                <div className="card-subtitle">{voucherCard.product.organization.name}</div>
                            )}

                            {voucherCard.type === 'regular' && (
                                <div>
                                    <div className="card-value euro">{voucherCard.amount_locale}</div>
                                </div>
                            )}
                        </div>

                        {!voucherCard.external && (
                            <Fragment>
                                <div className="card-qr_code show-sm">
                                    {voucher.address && (
                                        <QrCode
                                            padding={5}
                                            className={'card-qr_code-element'}
                                            value={makeQrCodeContent('voucher', voucher.address)}
                                        />
                                    )}

                                    <div className="card-qr_code-desc">
                                        {translate('voucher.card.valid_until')} {voucherCard.last_active_day_locale}
                                    </div>
                                </div>
                                <div className="card-qr_code hide-sm">
                                    {voucher.address && (
                                        <QrCode value={makeQrCodeContent('voucher', voucher.address)} />
                                    )}

                                    {!voucherCard.used && (
                                        <div className="card-qr_code-desc">
                                            {translate('voucher.card.valid_until')} {voucherCard.last_active_day_locale}
                                        </div>
                                    )}

                                    {voucherCard.product && voucherCard.used && (
                                        <div className="card-qr_code-desc">{translate('voucher.card.used')}</div>
                                    )}
                                </div>
                            </Fragment>
                        )}
                    </div>

                    <div className="card-footer">
                        {voucherCard.product && (
                            <Fragment>
                                {voucherCard.transactions.map((transaction) => (
                                    <div key={transaction.id} className="card-section">
                                        <div className="card-label">{translate('voucher.card.used_on')}:</div>
                                        <div className="card-value">{transaction?.created_at_locale}</div>
                                    </div>
                                ))}
                            </Fragment>
                        )}

                        <VoucherActions voucher={voucher} setVoucher={setVoucher} fetchVoucher={fetchVoucher} />
                    </div>
                </div>
            </div>

            {!voucherCard.product && (
                <div className="base-card base-card-sponsor">
                    <div className="card-inner">
                        <div className="card-body">
                            <div className="card-photo">
                                <img
                                    src={
                                        voucherCard?.fund?.organization?.logo?.sizes?.large ||
                                        assetUrl('/assets/img/placeholders/organization-large.png')
                                    }
                                    alt={voucherCard.fund?.organization?.name}
                                />
                            </div>
                            <div className="card-section">
                                <h2 className="card-title">{translate('voucher.card.header.title')}</h2>
                                <div className="card-description">
                                    <TranslateHtml
                                        i18n={'voucher.card.labels.description'}
                                        values={{ fund_name: voucherCard.title }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="card-label">
                                {translate('voucher.card.labels.contact_sponsor', {
                                    fund_name: voucherCard.title,
                                })}
                            </div>
                            <div className="card-value card-value-sm">
                                {translate('voucher.card.labels.email') + ' '}
                                <strong>{voucherCard.fund?.organization?.email}</strong>
                                <br />
                                {translate('voucher.card.labels.phone') + ' '}
                                <strong>{voucherCard.fund?.organization?.phone}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {voucherCard.product && (
                <div className="base-card base-card-sponsor">
                    <div className="card-inner">
                        <div className="card-body">
                            <div className="card-photo">
                                <img
                                    src={
                                        voucherCard?.product?.organization?.logo?.sizes?.large ||
                                        assetUrl('/assets/img/placeholders/organization-large.png')
                                    }
                                    alt={voucherCard.fund?.organization?.name}
                                />
                            </div>
                            <div className="card-section">
                                <h2 className="card-title">{translate('voucher.card.header.title')}</h2>
                                <div className="card-description">
                                    <TranslateHtml i18n={'voucher.card.labels.description'} />
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="card-label">{translate('voucher.card.labels.contact_sponsor')}</div>
                            <div className="card-value card-value-sm">
                                {translate('voucher.card.labels.email') + ' '}
                                <strong>{voucherCard.product.organization.email}</strong>
                                <br />
                                {translate('voucher.card.labels.phone') + ' '}
                                <strong>{voucherCard.product.organization.phone}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
