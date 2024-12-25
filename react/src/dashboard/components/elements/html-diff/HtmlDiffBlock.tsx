import * as Diff from 'diff';
import React, { Fragment, useCallback } from 'react';
import DOMPurify from 'dompurify';

export default function HtmlDiffBlock({ htmlFrom, htmlTo }: { htmlFrom: string; htmlTo: string }) {
    const extractTextWithNewlines = (htmlContent: string): string => {
        try {
            const sanitizedHtml = DOMPurify.sanitize(htmlContent);
            const parser = new DOMParser();
            const doc = parser.parseFromString(sanitizedHtml, 'text/html');

            const recursiveExtractTextWithNewlines = (node: Node): string => {
                let text = '';

                node.childNodes.forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        text += (child as Text).textContent;
                    } else if (
                        [
                            'P',
                            'DIV',
                            'H1',
                            'H2',
                            'H3',
                            'H4',
                            'H5',
                            'H6',
                            'LI',
                            'A',
                            'SPAN',
                            'BLOCKQUOTE',
                            'PRE',
                            'CODE',
                        ].includes((child as HTMLElement).tagName)
                    ) {
                        text += `\n${recursiveExtractTextWithNewlines(child)}\n`;
                    } else {
                        text += recursiveExtractTextWithNewlines(child);
                    }
                });

                return text;
            };

            return recursiveExtractTextWithNewlines(doc.body).replace(/\n+/g, '\n').trim();
        } catch (error) {
            console.error('Error parsing HTML content:', error);
            return '';
        }
    };

    const diffToHtml = useCallback((from: string, to: string) => {
        const diff = Diff.diffWords(from, to);
        const addedColor = '#00FF0040';
        const defaultColor = '#00000000';
        const removedColor = '#FF000040';

        return (
            <code
                style={{
                    border: '1px solid var(--border-color)',
                    padding: '10px 15px',
                    borderRadius: 'var(--border-radius)',
                    background: '#fefefe',
                    margin: '0 0',
                    display: 'block',
                }}>
                {diff.map((part, index) => {
                    const lines = part.value.split('\n').map((line, lineIndex) => (
                        <Fragment key={`${index}-${lineIndex}`}>
                            {line}
                            {lineIndex < part.value.split('\n').length - 1 && <br />}
                        </Fragment>
                    ));

                    return (
                        <span
                            key={index}
                            style={{
                                fontWeight: part.added || part.removed ? '600' : '400',
                                backgroundColor: part.added ? addedColor : part.removed ? removedColor : defaultColor,
                            }}>
                            {lines}
                        </span>
                    );
                })}
            </code>
        );
    }, []);

    return diffToHtml(extractTextWithNewlines(htmlFrom), extractTextWithNewlines(htmlTo));
}
