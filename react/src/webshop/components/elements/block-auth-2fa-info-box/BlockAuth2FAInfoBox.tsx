import React from 'react';
import BlockInfoBox from '../block-info-box/BlockInfoBox';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function BlockAuth2FAInfoBox({ className = '' }: { className?: string }) {
    const translate = useTranslate();

    return (
        <BlockInfoBox className={className}>
            {translate('global.info_box.2fa_description')}&nbsp;
            <a
                className="info-box-link"
                href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29407672516625-Tweefactorauthenticatie"
                target="_blank"
                rel="noreferrer">
                {translate('global.info_box.help_center_article')}
                <div className="mdi mdi-chevron-right" />
            </a>
        </BlockInfoBox>
    );
}
