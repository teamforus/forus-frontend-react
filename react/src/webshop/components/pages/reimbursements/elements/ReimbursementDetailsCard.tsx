import React, { Fragment, useCallback, useState } from 'react';
import Reimbursement from '../../../../props/models/Reimbursement';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { currencyFormat } from '../../../../../dashboard/helpers/string';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ReimbursementDetailsCard({
    compact = false,
    reimbursement,
}: {
    compact?: boolean;
    reimbursement: Partial<Reimbursement>;
}) {
    const translate = useTranslate();
    const [previewIndex, setPreviewIndex] = useState(0);

    const prevPreviewMedia = useCallback(() => {
        setPreviewIndex((index) => (index <= 0 ? reimbursement?.files?.length - 1 : index - 1));
    }, [reimbursement?.files?.length]);

    const nextPreviewMedia = useCallback(() => {
        setPreviewIndex((index) => (index >= reimbursement?.files?.length - 1 ? 0 : index + 1));
    }, [reimbursement?.files?.length]);

    return (
        <div className="block block-reimbursement" data-dusk="reimbursementOverview">
            <div className="reimbursement-section">
                <div className="reimbursement-media">
                    <div className="media-preview">
                        <img
                            src={reimbursement.files[previewIndex]?.preview?.sizes?.thumbnail}
                            alt="reimbursement media"
                        />
                    </div>
                    {reimbursement?.files?.length > 1 && (
                        <div className="media-pagination">
                            <div className="media-pagination-prev" onClick={prevPreviewMedia}>
                                <div className="mdi mdi-chevron-left" />
                            </div>
                            <div className="media-pagination-nav">
                                <div className="media-pagination-counter">
                                    {previewIndex + 1} / {reimbursement.files.length}
                                </div>
                                <div className="media-pagination-list">
                                    {reimbursement.files.map((file, index) => (
                                        <div
                                            key={file.uid}
                                            className={`media-pagination-item ${
                                                index === previewIndex ? 'active' : ''
                                            }`}
                                            onClick={() => setPreviewIndex(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="media-pagination-next" onClick={nextPreviewMedia}>
                                <div className="mdi mdi-chevron-right" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="reimbursement-props">
                    {!compact && <h2 className="reimbursement-title">{translate('reimbursements.details.title')}</h2>}
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.title')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewTitle">
                            {reimbursement.title}
                        </div>
                    </div>
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.amount')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewAmount">
                            {reimbursement.amount_locale || currencyFormat(parseFloat(reimbursement.amount))}
                        </div>
                    </div>
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.sponsor')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewSponsorName">
                            {reimbursement.fund?.organization?.name}
                        </div>
                    </div>
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.fund')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewFundName">
                            {reimbursement.fund?.name}
                        </div>
                    </div>
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.iban')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewIban">
                            {reimbursement.iban}
                        </div>
                    </div>
                    <div className="reimbursement-prop">
                        <div className="reimbursement-prop-label">
                            {translate('reimbursements.details.labels.iban_name')}
                        </div>
                        <div className="reimbursement-prop-value" data-dusk="reimbursementOverviewIbanName">
                            {reimbursement.iban_name}
                        </div>
                    </div>
                    {!compact && (
                        <Fragment>
                            <h2 className="reimbursement-title">
                                {translate('reimbursements.details.labels.description')}
                            </h2>
                            <div className="reimbursement-text" data-dusk="reimbursementOverviewDescription">
                                {reimbursement.description}
                            </div>
                        </Fragment>
                    )}

                    {!compact && reimbursement.state == 'declined' && reimbursement.reason && (
                        <Fragment>
                            <h2 className="reimbursement-title">
                                {translate('reimbursements.details.labels.decline_reason')}
                            </h2>
                            <div className="reimbursement-text">{reimbursement.reason}</div>
                        </Fragment>
                    )}

                    {reimbursement.state === 'draft' && (
                        <StateNavLink
                            name={WebshopRoutes.REIMBURSEMENT_EDIT}
                            params={{ id: reimbursement.id }}
                            className="button button-primary-outline button-sm flex flex-center"
                            dataDusk="reimbursementOverviewEditButton">
                            <div className="mdi mdi-pencil icon-start" />
                            {translate('reimbursements.details.buttons.edit')}
                        </StateNavLink>
                    )}
                </div>
            </div>
        </div>
    );
}
