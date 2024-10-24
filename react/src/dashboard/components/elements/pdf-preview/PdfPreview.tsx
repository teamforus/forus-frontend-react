import React, { useEffect, useRef } from 'react';

export default function PdfPreview({ rawPdfFile, className = '' }: { rawPdfFile?: Blob; className?: string }) {
    const element = useRef(null);

    useEffect(() => {
        new Response(rawPdfFile).arrayBuffer().then((data) => {
            // Asynchronous download of PDF
            const loadingTask = window['pdfjsDist'].getDocument({ data });

            let currPage = 1;
            let numPages = null;

            loadingTask.promise.then(
                function (pdf: {
                    numPages: number;
                    getPage: (arg0: number) => Promise<{
                        getViewport: ({ scale }) => { height: number; width: number };
                        render: ({ canvasContext, viewport }) => { promise: Promise<() => void> };
                    }>;
                }): void {
                    // Fetch the first page
                    numPages = pdf.numPages;

                    const fetchPage = function (fetchPageNumber: number) {
                        pdf.getPage(fetchPageNumber).then((page) => {
                            const scale = 1.5;
                            const viewport = page.getViewport({ scale });

                            const canvas = document.createElement('canvas');

                            element?.current?.append(canvas);

                            // Prepare canvas using PDF page dimensions
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            // Render PDF page into canvas context
                            const renderContext = { canvasContext: context, viewport: viewport };
                            const renderTask = page.render(renderContext);

                            renderTask.promise.then(function () {
                                if (++currPage < numPages) {
                                    fetchPage(currPage);
                                }
                            });
                        });
                    };

                    fetchPage(currPage);
                },

                function (reason: unknown) {
                    // PDF loading error
                    console.error('error', reason);
                },
            );
        });
    }, [rawPdfFile]);

    return <div className={className} ref={element} />;
}
