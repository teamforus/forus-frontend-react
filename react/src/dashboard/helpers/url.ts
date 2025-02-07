import EnvDataProp from '../../props/EnvData';

export const assetUrl = (uri: string, envData: EnvDataProp) => {
    return envData ? `/${envData?.webRoot}/${uri.replace(/^\/+/, '')}`.replace(/^\/+/, '/') : null;
};

export const thumbnailUrl = (type: string, envData: EnvDataProp) => {
    return assetUrl(`/assets/img/placeholders/${type}-thumbnail.png`, envData);
};

export const isValidLocaleString = (locale: string) => {
    try {
        new Intl.NumberFormat(locale);
        return true;
    } catch {
        return false;
    }
};
