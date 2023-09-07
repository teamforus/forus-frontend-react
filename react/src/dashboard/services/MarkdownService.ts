import ApiRequestService from './ApiRequestService';
import Identity from '../props/models/Identity';
import { useState } from 'react';
import TurnDownService from 'turndown';
import * as turnDownPluginGfm from 'turndown-plugin-gfm';
import { ResponseSimple } from '../props/ApiResponses';

export default class MarkdownService<T = { data: Identity }> {
    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform';

    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public getTurnDownService() {
        const turnDownService = new TurnDownService({ headingStyle: 'atx' });

        turnDownService.addRule('strikethrough', {
            filter: (node) => {
                return (
                    node.className === 'youtube-root' &&
                    node.children.length > 0 &&
                    node.children[0].tagName.toLowerCase() === 'iframe'
                );
            },
            replacement: function () {
                // eslint-disable-next-line prefer-rest-params
                return `[](${arguments[1].children[0].src.replace(
                    'https://www.youtube.com/embed/',
                    'https://www.youtube.com/watch?v=',
                )})`;
            },
        });

        turnDownService.use(turnDownPluginGfm.gfm);

        return turnDownService;
    }

    public toMarkdown(content_html: string) {
        const turnDownService = this.getTurnDownService();
        const markdown = turnDownService.turndown(content_html).split('\n');

        return markdown
            .map((line, index) => {
                return index != 0 && markdown[index - 1] === '' && line.trim() === '' ? '&nbsp;  ' : line;
            })
            .join('\n');
    }

    public toHtml(markdown: string): Promise<ResponseSimple<{ html: string }>> {
        return this.apiRequest.post(`${this.prefix}/format`, { markdown });
    }
}

export function useMarkdownService(): MarkdownService {
    const [service] = useState(new MarkdownService());

    return service;
}
