import React, { Fragment } from 'react';
import { splitTextIntoLines } from '../../../helpers/string';

export default function TruncatedMultilineText({
    text,
    className,
    maxSymbolsPerLine,
    maxLines,
}: {
    text: string;
    className?: string;
    maxSymbolsPerLine: number;
    maxLines: number;
}) {
    const lines = splitTextIntoLines(text, maxSymbolsPerLine, maxLines);

    return (
        <Fragment>
            {lines.map((line: string, index: number) => (
                <span key={index} className={className}>
                    {line}
                    {index < lines.length - 1 && <br />}
                </span>
            ))}
        </Fragment>
    );
}
