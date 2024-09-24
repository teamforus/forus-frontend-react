import React, { Fragment } from 'react';

export default function MultilineText({ text, className }: { text: string; className?: string }) {
    return text?.split('\n')?.map((line: string, index: number) => (
        <Fragment key={index}>
            {line.trim() !== '' ? (
                <div className={className}>
                    {line}
                    <br />
                </div>
            ) : (
                <br />
            )}
        </Fragment>
    ));
}
