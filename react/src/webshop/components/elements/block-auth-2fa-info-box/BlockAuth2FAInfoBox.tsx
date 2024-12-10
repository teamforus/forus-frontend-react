import React from 'react';
import BlockInfoBox from '../block-info-box/BlockInfoBox';

export default function BlockAuth2FAInfoBox({ className = '' }: { className?: string }) {
    return (
        <BlockInfoBox className={className}>
            Kijk voor meer informatie over 2FA op ons:&nbsp;
            <a
                className="info-box-link"
                href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29407672516625-Tweefactorauthenticatie"
                target="_blank"
                rel="noreferrer">
                Helpcenter artikel
                <div className="mdi mdi-chevron-right" />
            </a>
        </BlockInfoBox>
    );
}
