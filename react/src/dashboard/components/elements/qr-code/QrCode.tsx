import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import QRCode from 'easyqrcodejs';
import { CSSObject } from 'styled-components';

export default function QrCode({
    value,
    background = null,
    description = null,
    dotScale = 0.7,
    padding = 0,
    logo = null,
    logoWidth = 80,
    logoHeight = 80,
    style = null,
    className = '',
}: {
    value: string;
    background?: string;
    description?: string;
    dotScale?: number;
    padding?: number;
    logo?: string;
    logoWidth?: number;
    logoHeight?: number;
    style?: CSSObject;
    className?: string;
}) {
    const code = useRef<HTMLDivElement>();
    const [, setQrCode] = useState(null);

    useEffect(() => {
        if (!value || !code.current) {
            return;
        }

        setQrCode((qrCode: { clear: CallableFunction }) => {
            qrCode?.clear();

            return new QRCode(code.current, {
                text: value,
                logo: logo,
                logoWidth: logoWidth,
                logoHeight: logoHeight,
                padding: padding,
                dotScale: dotScale,
                backgroundColor: background,
                correctLevel: QRCode.CorrectLevel.M,
            });
        });
    }, [code, padding, dotScale, value, background, description, logo, setQrCode, logoWidth, logoHeight]);

    return (
        <div className={`block block-qr-code ${className || ''}`}>
            <div className="qr_code" ref={code} style={style} />
            {description && <div className="qr_code-desc">description</div>}
        </div>
    );
}
