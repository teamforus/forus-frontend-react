import React, { DOMAttributes, HTMLAttributes, useCallback, useEffect, useState } from 'react';

export default function ProgressPie({
    color,
    title,
    attr,
    attrImg,
    size = 40,
    progress = 0,
    strokeWidth = 4,
    gradientMap,
    strokeColor,
    defaultColor = '#1c407b',
    backgroundColor,
    defaultBackgroundColor = '#ffffff',
    className = '',
    children,
}: {
    title?: string;
    attr?: DOMAttributes<HTMLDivElement> | HTMLAttributes<HTMLDivElement>;
    attrImg?: DOMAttributes<HTMLDivElement> | HTMLAttributes<HTMLDivElement>;
    size?: number;
    color?: string;
    progress?: number;
    strokeWidth?: number;
    strokeColor?: string;
    defaultColor?: string;
    backgroundColor?: string;
    gradientMap?: Array<Array<number | string>> | ((progress: number) => string);
    defaultBackgroundColor?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const [image, setImage] = useState<string>(null);

    const [canvas] = useState(document.createElement('canvas'));
    const [context] = useState(canvas.getContext('2d'));

    const getGradientColor = useCallback(
        (gradientMap: Array<Array<number | string>> | ((progress: number) => string), progress: number): string => {
            if (typeof gradientMap == 'function') {
                return gradientMap(progress);
            }

            if (Array.isArray(gradientMap)) {
                const gradientValue = gradientMap.find(
                    (item) => progress >= parseInt(item[0].toString()) && progress <= parseInt(item[1].toString()),
                );

                return gradientValue ? gradientValue[2].toString() : defaultColor;
            }

            return defaultColor;
        },
        [defaultColor],
    );

    const getColor = useCallback(
        (progress: number): string => {
            return gradientMap ? getGradientColor(gradientMap, progress) : color || defaultColor;
        },
        [gradientMap, getGradientColor, color, defaultColor],
    );

    const getBackgroundColor = useCallback(() => {
        return backgroundColor || defaultBackgroundColor;
    }, [backgroundColor, defaultBackgroundColor]);

    const getStrokeColor = useCallback(
        (progress: number) => (gradientMap ? getGradientColor(gradientMap, progress) : strokeColor || defaultColor),
        [defaultColor, getGradientColor, gradientMap, strokeColor],
    );

    const makeImage = useCallback(() => {
        const color = getColor(progress);
        const backgroundColor = getBackgroundColor();

        const strokeColor = getStrokeColor(progress);
        const strokeOffset = strokeWidth ? strokeWidth / 2 : 0;

        if (canvas.width != size || canvas.height != size) {
            canvas.width = size;
            canvas.height = size;
        }

        context.clearRect(0, 0, size, size);

        context.beginPath();
        context.lineWidth = 0;
        context.fillStyle = backgroundColor;
        context.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = size / 2 - strokeOffset;
        context.arc(size / 2, size / 2, size / 4 - strokeOffset / 2, -0.5 * Math.PI, (-0.5 + progress * 2) * Math.PI);
        context.stroke();

        if (strokeWidth) {
            context.beginPath();
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            context.arc(size / 2, size / 2, size / 2 - strokeWidth / 2, 0, 2 * Math.PI);
            context.stroke();
        }

        return canvas.toDataURL('image/png');
    }, [canvas, context, getBackgroundColor, getColor, getStrokeColor, progress, size, strokeWidth]);

    useEffect(() => {
        setImage(makeImage());
    }, [makeImage]);

    if (!image) {
        return <></>;
    }

    return (
        <div {...attr} title={title} className={`block block-progress-pie ${className}`}>
            <img {...attrImg} src={image} alt={''} />
            {children}
        </div>
    );
}
