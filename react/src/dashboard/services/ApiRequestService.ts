import events from '../helpers/events';
import EnvDataProp from '../../props/EnvData';
import { RequestConfig } from '../props/ApiResponses';

export default class ApiRequestService<T = null> {
    protected static host = '';
    protected static envData: EnvDataProp = null;

    public static setEnvData(envData: EnvDataProp) {
        ApiRequestService.envData = envData;
    }

    public static setHost(host: string) {
        ApiRequestService.host = host;
    }

    /**
     * Get API url
     */
    public static getHost() {
        let host = ApiRequestService.host;

        while (host[host.length - 1] === '/') {
            host = host.slice(0, host.length - 1);
        }

        return host;
    }

    /**
     * Make request headers
     */
    private makeHeaders() {
        return {
            Accept: 'application/json',
            'Accept-Language': localStorage.locale || 'nl',
            'Client-Key': ApiRequestService.envData?.client_key,
            'Client-Type': ApiRequestService.envData?.client_type,
            'Content-Type': 'application/json',
            ...(localStorage.active_account ? { Authorization: 'Bearer ' + localStorage.active_account } : {}),
        };
    }

    /**
     * Make GET Request
     *
     * @param endpoint
     * @param data
     * @param config
     */
    public get<G = T>(endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<G> {
        return this.ajax<G>('GET', endpoint, data, config);
    }

    /**
     * Make POST Request
     *
     * @param endpoint
     * @param data
     * @param config
     */
    public post<P = T>(endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<P> {
        return this.ajax<P>('POST', endpoint, data, config);
    }

    /**
     * Make PATCH Request
     *
     * @param endpoint
     * @param data
     * @param config
     */
    public patch<P = T>(endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<P> {
        return this.ajax<P>('PATCH', endpoint, data, config);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Make PUT Request
     *
     * @param endpoint
     * @param data
     * @param config
     */
    public put<P = T>(endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<P> {
        return this.ajax<P>('PUT', endpoint, data, config);
    }

    /**
     * Make DELETE Request
     *
     * @param endpoint
     * @param data
     * @param config
     */
    public delete<D = T>(endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<D> {
        return this.ajax<D>('DELETE', endpoint, data, config);
    }

    /**
     * Make AJAX Request
     *
     * @param method
     * @param endpoint
     * @param data
     * @param config
     */
    public ajax<A>(method: string, endpoint: string, data: object = {}, config: RequestConfig = {}): Promise<A> {
        return new Promise((resolve, reject) => {
            let getQueryString = '';

            const xhr = new XMLHttpRequest();
            const headers = this.makeHeaders();

            const cfg =
                typeof config === 'function'
                    ? config({ headers })
                    : { ...config, headers: { ...headers, ...(config?.headers || {}) } };

            Object.keys(cfg.headers).forEach((key: string) => {
                if (cfg.headers[key] === undefined) {
                    delete cfg.headers[key];
                }
            });

            if (typeof data === 'object' && !(data instanceof FormData)) {
                data = { ...data };
            }

            if (method === 'GET') {
                getQueryString = this.dataToGetQueryString(data);
            } else {
                if (data instanceof FormData) {
                    delete cfg.headers['Content-Type'];
                    cfg.body = data;
                } else {
                    cfg.body = JSON.stringify(data);
                }
            }

            xhr.open(method, this.endpointToUrl(endpoint, getQueryString), true);

            Object.keys(cfg.headers).forEach((key: string) => {
                xhr.setRequestHeader(key, cfg.headers[key]);
            });

            if (cfg?.onProgress) {
                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        cfg?.onProgress({ progress: (event.loaded / event.total) * 100 }, xhr);
                    }
                };
            }

            if (cfg?.onAbort) {
                xhr.onabort = cfg?.onAbort;
            }

            if (cfg?.responseType) {
                xhr.responseType = cfg?.responseType;
            }

            if (cfg?.onXhr) {
                cfg.onXhr(xhr);
            }

            xhr.onload = async () => {
                const isText = !xhr.responseType || xhr.responseType == 'text';
                const headers = xhr.getAllResponseHeaders();
                const headersList = headers.trim().split(/[\r\n]+/);

                const headerMap = headersList?.reduce((headerMap: object, line: string) => {
                    const parts = line.split(': ');
                    const header = parts.shift();

                    return { ...headerMap, [header]: parts.join(': ') };
                }, {});

                const resData = {
                    data: isText ? this.parseJson(xhr.responseText) : xhr.response,
                    status: xhr.status,
                    headers: headerMap,
                    response: xhr,
                };

                if (resData.status === 200 || resData.status === 201 || resData.status === 204) {
                    resolve(resData as A);
                } else {
                    if (resData.status == 401) {
                        events.publish('api-response:401', resData);
                    }

                    reject(resData);
                }
            };

            xhr.onerror = () => reject({ data: null, status: xhr.status, response: xhr });

            if (method === 'GET') {
                xhr.send();
            } else {
                xhr.send(cfg.body);
            }
        });
    }

    /**
     * @param res
     * @private
     */
    private parseJson(res: string): unknown {
        try {
            return JSON.parse(res);
        } catch {
            return null;
        }
    }

    /**
     * Build GET query parameters string
     * @param data
     * @private
     */
    private dataToGetQueryString(data: object) {
        const props = Object.keys(data);
        const queryParams: Array<string> = [];

        props.forEach((prop: string) => {
            if (Array.isArray(data[prop])) {
                data[prop].forEach((element: unknown) =>
                    queryParams.push(prop + '[]=' + encodeURIComponent(element?.toString())),
                );
            } else {
                if (data[prop] !== null && data[prop] !== undefined) {
                    queryParams.push(prop + '=' + encodeURIComponent(data[prop]));
                }
            }
        });

        return queryParams.length > 0 ? '?' + queryParams.join('&') : '';
    }

    /**
     * @param endpoint
     * @param getParamsString
     */
    public endpointToUrl(endpoint: string, getParamsString = '') {
        return ApiRequestService.getHost() + (endpoint || '') + getParamsString;
    }
}
