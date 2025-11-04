import Organization, { Permission } from '../props/models/Organization';

export const hasPermission = (organization: Organization, permissions: Permission | Array<Permission>, all = false) => {
    if (!organization || !organization.permissions) {
        return false;
    }

    if (typeof permissions === 'string') {
        permissions = [permissions];
    }

    if (all) {
        return (
            permissions.filter((permission) => {
                return organization.permissions.includes(permission);
            }).length == permissions.length
        );
    }

    return (
        permissions.filter((permission) => {
            return organization.permissions.includes(permission);
        }).length > 0
    );
};

export const extractText = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return doc.body.textContent || '';
};

export const fileToText = async (file: File) => {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.toString());
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

export async function runSequentially<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = [];

    for (const task of tasks) {
        results.push(await task());
    }

    return results;
}

export function makeQrCodeContent(type: 'voucher' | 'auth_token' | 'demo_voucher', value: string) {
    return JSON.stringify({ type, value });
}
