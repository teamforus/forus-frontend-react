import React, { useMemo, useState } from 'react';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';

export default function BlockCard2FAWarning({
    fund,
    buttonPosition = 'top',
}: {
    fund: Fund;
    buttonPosition?: 'bottom' | 'top';
}) {
    const translate = useTranslate();

    const settings = useMemo(() => {
        return fund?.auth_2fa_policy == 'global' ? fund?.organization_funds_2fa : fund;
    }, [fund]);

    const hasRestrictions = useMemo(() => {
        return (
            settings?.auth_2fa_policy == 'restrict_features' &&
            (settings?.auth_2fa_restrict_emails ||
                settings?.auth_2fa_restrict_auth_sessions ||
                settings?.auth_2fa_restrict_reimbursements)
        );
    }, [settings]);

    const [showMore2FADetails, setShowMore2FADetails] = useState(false);

    if (fund && settings.auth_2fa_policy == 'optional') {
        return null;
    }

    return (
        <div className="block block-action-card block-action-card-compact block-action-card-expandable">
            <div className="flex block-action-card-main">
                <div className="block-card-logo" aria-hidden="true">
                    <em className="mdi mdi-alert" />
                </div>
                {settings.auth_2fa_policy == 'required' && (
                    <div className="block-card-details">
                        <h3 className="block-card-title">
                            {translate('global.card_2fa_warning.2fa_policy.required.title')}
                        </h3>
                        <div className="block-card-description">
                            {translate('global.card_2fa_warning.2fa_policy.required.description')}
                        </div>
                    </div>
                )}

                {settings.auth_2fa_policy == 'restrict_features' && (
                    <div className="block-card-details">
                        <h3 className="block-card-title">
                            {translate('global.card_2fa_warning.2fa_policy.restrict_features.title')}
                        </h3>
                        <div className="block-card-description">
                            {translate('global.card_2fa_warning.2fa_policy.restrict_features.description')}
                        </div>
                    </div>
                )}

                {hasRestrictions && (
                    <div
                        className={classNames(
                            'block-card-actions',
                            buttonPosition === 'top' && 'block-card-actions-top',
                            buttonPosition === 'bottom' && 'block-card-actions-bottom',
                        )}>
                        {showMore2FADetails ? (
                            <div className="button button-text" onClick={() => setShowMore2FADetails(false)}>
                                {translate('global.card_2fa_warning.2fa_policy.show_less')}
                                <em className="mdi mdi-chevron-up icon-right" />
                            </div>
                        ) : (
                            <div className="button button-text" onClick={() => setShowMore2FADetails(true)}>
                                {translate('global.card_2fa_warning.2fa_policy.show_more')}
                                <em className="mdi mdi-chevron-right icon-right" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {hasRestrictions && showMore2FADetails && (
                <div className="block-action-card-details flex flex-vertical">
                    {settings.auth_2fa_restrict_emails && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-account-outline" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">
                                    {translate('global.card_2fa_warning.email_restrictions.title')}
                                </h3>
                                <div className="block-card-description">
                                    {translate('global.card_2fa_warning.email_restrictions.description')}
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.auth_2fa_restrict_auth_sessions && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-shield-account" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">
                                    {translate('global.card_2fa_warning.session_restrictions.title')}
                                </h3>
                                <div className="block-card-description">
                                    {translate('global.card_2fa_warning.session_restrictions.description')}
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.auth_2fa_restrict_reimbursements && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-list-box-outline" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">
                                    {translate('global.card_2fa_warning.reimbursement_restrictions.title')}
                                </h3>
                                <div className="block-card-description">
                                    {translate('global.card_2fa_warning.reimbursement_restrictions.description')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
