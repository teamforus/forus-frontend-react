export type ProblemJson = {
    type?: string;
    title?: string;
    detail?: string;
    status?: number;
};

export function parseProblemJson(err: unknown): ProblemJson {
    if (!err) return { title: 'Onbekende fout', detail: '', status: 500 };

    if (typeof err === 'object') {
        const e = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        if ('title' in e && 'status' in e) {
            return {
                type: e.type,
                title: e.title,
                detail: e.detail ?? '',
                status: e.status,
            };
        }
        if ('response' in e) {
            const resp = e.response;

            if (resp?.data && typeof resp.data === 'object') {
                return {
                    type: resp.data.type,
                    title: resp.data.title ?? 'Onbekende fout',
                    detail: resp.data.detail ?? '',
                    status: resp.data.status ?? resp.status,
                };
            }

            return {
                title: resp.statusText ?? 'Onbekende fout',
                detail: '',
                status: resp.status ?? 500,
            };
        }
    }
    // Fallback: show err as string
    return {
        title: 'Onbekende fout',
        detail: typeof err === 'string' ? err : JSON.stringify(err),
        status: 500,
    };
}
