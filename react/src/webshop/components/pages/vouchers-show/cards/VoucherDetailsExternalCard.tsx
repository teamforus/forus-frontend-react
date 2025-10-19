import React from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import { strLimit } from '../../../../../dashboard/helpers/string';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function VoucherDetailsExternalCard({ voucher }: { voucher: Voucher }) {
    const voucherCard = useVoucherData(voucher);

    const translate = useTranslate();

    return (
        <div className="block block-voucher block-voucher-combined">
            <h1 className="sr-only">Jouw tegoed</h1>
            <div className="base-card base-card-voucher">
                <div className="card-inner">
                    <div className="card-body">
                        <div className="card-photo">
                            <img className="voucher-img" src={voucherCard.thumbnail} alt={''} />
                        </div>
                        <div className="card-section">
                            <h2 className="card-title">{strLimit(voucherCard.title, 40)}</h2>

                            {!voucherCard.product ? (
                                <div className="card-subtitle">{voucherCard.fund?.organization?.name}</div>
                            ) : (
                                <div className="card-subtitle">{voucherCard.product?.organization?.name}</div>
                            )}

                            {voucherCard.type === 'regular' && (
                                <div>
                                    <div className="card-value euro">{voucherCard.amount_locale}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className="card-section">
                            <h2 className="card-title">{translate('voucher.card_combined.header.title')}</h2>
                            <div className="card-description">
                                <TranslateHtml
                                    i18n={`voucher.card_combined.labels.${voucherCard.fund?.key}.how_it_works`}
                                    i18nDefault={'voucher.card_combined.labels.how_it_works'}
                                />
                            </div>
                        </div>
                        <div className="card-section">
                            <div className="card-title">
                                {translate('voucher.card_combined.labels.contact_sponsor')}
                            </div>
                            <div className="card-description">
                                <span>{translate('voucher.card_combined.labels.contact_sponsor_details')}</span>
                                <br />
                                E-mailadres: <span>{voucherCard.fund.organization.email}</span>
                                <br />
                                Telefoonnummer: <span>{voucherCard.fund.organization.phone}</span>
                                <br />
                                <br />
                                <strong>
                                    {translate(
                                        `voucher.card_combined.labels.${voucherCard.fund.key}.redirect_to`,
                                        null,
                                        'voucher.card_combined.labels.redirect_to',
                                    )}
                                </strong>
                                <br />
                                {voucherCard.fund.key == 'IIT' && (
                                    <span>
                                        Klik dan{' '}
                                        <StateNavLink name={'funds'} className="card-description-link">
                                            hier
                                        </StateNavLink>{' '}
                                        om terug te gaan naar het overzicht van de vergoedingen.
                                    </span>
                                )}
                                {voucherCard.fund.key == 'meedoenregeling_volwassenen_ww' && (
                                    <span>
                                        Vraag uw kosten terug door een bon in te sturen. Klik{' '}
                                        <StateNavLink
                                            name={'reimbursements-create'}
                                            params={{ voucher_id: voucher.id }}
                                            className="card-description-link">
                                            hier
                                        </StateNavLink>{' '}
                                        om uw bon in te sturen.{' '}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
