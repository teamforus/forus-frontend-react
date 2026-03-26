import { useMemo } from 'react';

export default function useRenderedMarkdownTables(content: string) {
    return useMemo(() => {
        if (typeof document === 'undefined') {
            return content;
        }

        const root = document.createElement('div');
        root.innerHTML = content;

        root.querySelectorAll('table').forEach((table) => {
            try {
                const head = table.querySelector('thead');
                const headers = [...table.querySelectorAll('thead tr th')];
                const firstRow = table.querySelector('tbody tr:first-child');

                // Markdown tables with blank header cells use the first body row as the visible header.
                if (
                    head &&
                    firstRow &&
                    headers.length > 0 &&
                    headers.every((th) => (th.textContent || '').trim() == '')
                ) {
                    const fixedHeadRow = document.createElement('tr');

                    [...firstRow.querySelectorAll('td')].forEach((td) => {
                        const th = document.createElement('th');
                        th.textContent = td.textContent;
                        fixedHeadRow.appendChild(th);
                    });

                    head.replaceChildren(fixedHeadRow);
                    firstRow.remove();
                }
            } catch (e) {
                console.error('Could not fix table headers: ' + e.toString());
            }

            try {
                // A h4 heading immediately above a table should render as that table's caption.
                if (table.previousElementSibling?.nodeName?.toLowerCase() == 'h4') {
                    const caption = (table as HTMLTableElement).createCaption();
                    caption.textContent = table.previousElementSibling.textContent;
                    table.previousElementSibling.remove();
                }
            } catch (e) {
                console.error('Could not convert table caption: ' + e.toString());
            }

            try {
                if (table.parentNode && !table.parentElement?.classList.contains('table-wrap')) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('table-wrap');
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }
            } catch (e) {
                console.error('Could not wrap table: ' + e.toString());
            }

            try {
                const headers = [...table.querySelectorAll('thead tr th')];
                const rows = table.querySelectorAll('tbody tr');

                headers.forEach((header, index) => {
                    rows.forEach((row) => {
                        const cell = row.querySelectorAll('td')[index];

                        if (cell) {
                            cell.dataset.title = header.textContent;
                        }
                    });
                });

                table.classList.add('table-responsive');
            } catch (e) {
                console.error('Could not apply table responsiveness: ' + e.toString());
            }
        });

        root.querySelectorAll('a').forEach((link) => {
            try {
                const url = new URL(link.href);

                if (url.origin === window.location.origin) {
                    link.target = '_self';
                    link.rel = '';
                } else {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
            } catch (e) {
                console.error('Could not update link target: ' + e.toString(), link.href);
            }
        });

        return root.innerHTML;
    }, [content]);
}
