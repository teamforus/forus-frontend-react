import React from 'react';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import { strLimit } from '../../../../helpers/string';

export default function VouchersTableRowStatus({ voucher }: { voucher: SponsorVoucher }) {
    return voucher.expired ? (
        <div className="td-boolean">
            <em className="mdi mdi-close" />
            <span className="text-md text-muted-dark">Verlopen</span>
        </div>
    ) : (
        <div className="td-boolean">
            {voucher.state === 'active' && <em className="mdi mdi-check-circle" />}
            {(voucher.state === 'pending' || voucher.state === 'deactivated') && <em className="mdi mdi-close" />}

            <span className="block block-tooltip-details block-tooltip-hover text-md text-muted-dark">
                {voucher.state_locale}
                <div className="tooltip-content tooltip-content-left tooltip-content-fit">
                    <div className="tooltip-text">
                        <span>
                            <span className="text-primary text-sm text-strong">E-MAIL:</span>
                            <br />
                            <span className="text-strong">
                                {strLimit(voucher.identity_email, 32) || 'Niet toegewezen'}
                            </span>
                        </span>

                        {(voucher.identity_bsn || voucher.relation_bsn) && (
                            <span>
                                <br />
                                <span className="text-primary text-sm text-strong">BSN:</span>
                                <br />
                                <span className="text-strong">{voucher.identity_bsn || voucher.relation_bsn}</span>
                            </span>
                        )}

                        {voucher.activation_code && (
                            <span>
                                <br />
                                <span className="text-primary text-sm text-strong">CODE:</span>
                                <br />
                                <span className="text-strong">{voucher.activation_code}</span>
                            </span>
                        )}

                        {(voucher.client_uid || voucher.activation_code) && (
                            <span>
                                <br />
                                <span className="text-primary text-sm text-strong">UNIEK NUMMER:</span>
                                <br />
                                <span className="text-strong">{voucher.client_uid || 'Nee'}</span>
                            </span>
                        )}

                        {(voucher.client_uid || voucher.activation_code) && (
                            <span>
                                <br />
                                <span className="text-primary text-sm text-strong">PASNUMMER:</span>
                                <br />
                                <span className="text-strong">{voucher.client_uid || 'Nee'}</span>
                            </span>
                        )}
                    </div>
                </div>
            </span>
        </div>
    );
}
