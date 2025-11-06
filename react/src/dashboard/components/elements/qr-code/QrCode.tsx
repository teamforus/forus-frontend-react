import React, { DOMAttributes, HTMLAttributes, useRef, useState } from 'react';
import { useEffect } from 'react';
import QRCode from 'easyqrcodejs';
import classNames from 'classnames';

export default function QrCode({
    value,
    background = null,
    description = null,
    dotScale = 0.7,
    padding = 0,
    logo = null,
    logoWidth = 80,
    logoHeight = 80,
    className = '',
    qrCodeAttrs = null,
    dusk = null,
}: {
    value: string;
    background?: string;
    description?: string;
    dotScale?: number;
    padding?: number;
    logo?: string;
    logoWidth?: number;
    logoHeight?: number;
    className?: string;
    qrCodeAttrs?: DOMAttributes<HTMLDivElement> | HTMLAttributes<HTMLDivElement>;
    dusk?: string;
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
        <div className={classNames('block block-qr-code', className)} data-dusk={dusk}>
            <div className="qr_code" ref={code} {...qrCodeAttrs} />
            {description && <div className="qr_code-desc">description</div>}
        </div>
    );
}
