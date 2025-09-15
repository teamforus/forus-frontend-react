export type ProblemJson = {
    type?: string;
    title?: string;
    detail?: string;
    status?: number;
};

export function parseProblemJson(err: unknown): ProblemJson {
    if (!err) return { title: 'Onbekende fout', detail: '', status: 500 };

    if (typeof err === 'object' && 'response' in err) {
        const resp = (err as any).response;
        if (resp?.data && typeof resp.data === 'object') {
            return {
                type: resp.data.type,
                title: resp.data.title,
                detail: resp.data.detail,
                status: resp.data.status ?? resp.status,
            };
        }
        return { title: resp.statusText, detail: '', status: resp.status };
    }

    return { title: 'Onbekende fout', detail: String(err), status: 500 };
}
