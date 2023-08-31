import Organization from '../props/models/Organization';
import { HTMLAttributes } from 'react';

export const hasPermission = (organization: Organization, permissions: string | Array<string>, all = false) => {
    if (!organization || !organization.permissions) {
        return false;
    }

    if (typeof permissions === 'string') {
        permissions = [permissions];
    }

    if (all) {
        return (
            permissions.filter((permissionItem) => {
                return organization.permissions.indexOf(permissionItem) !== -1;
            }).length == permissions.length
        );
    }

    return (
        permissions.filter((permissionItem) => {
            return organization.permissions.indexOf(permissionItem) !== -1;
        }).length > 0
    );
};

export const classList = (classNames: Array<string> | HTMLAttributes<HTMLElement>['className'] | null) => {
    return (Array.isArray(classNames) ? classNames : [classNames])
        .filter((className) => className)
        .map((className) => className.trim())
        .join(' ');
};
