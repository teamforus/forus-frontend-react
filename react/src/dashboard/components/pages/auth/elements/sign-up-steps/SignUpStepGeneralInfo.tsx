import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../hooks/useTranslate';
import SignUpFooter from '../../../../../../webshop/components/elements/sign-up/SignUpFooter';

export default function SignUpStepGeneralInfo({
    panelType,
    onStepNext,
}: {
    panelType: 'sponsor' | 'validator';
    onStepNext: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="sign_up-pane">
            <div className="sign_up-pane-header">{translate(`sign_up_${panelType}.header.title_step_1`)}</div>

            <div
                className={`sign_up-pane-body ${
                    panelType == 'validator' ? '' : 'flex flex-vertical flex-vertical-reverse'
                }`}>
                <div className="sign_up-pane-text">{translate(`sign_up_${panelType}.header.subtitle_step_1`)}</div>

                <div className="sign_up-pane-media">
                    {panelType === 'sponsor' ? (
                        <img src={assetUrl('/assets/img/sponsor_sign_up_first_step.svg')} alt={''} />
                    ) : (
                        <img src={assetUrl('/assets/img/sign_up_first_step.png')} alt={''} />
                    )}
                </div>
            </div>

            <SignUpFooter
                startActions={<div className="button button-text button-text-padless" />}
                endActions={
                    <button type="button" className="button button-text button-text-padless" onClick={onStepNext}>
                        {translate(`sign_up_${panelType}.buttons.next`)}
                        <em className="mdi mdi-chevron-right icon-right" />
                    </button>
                }
            />
        </div>
    );
}
