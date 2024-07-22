export type ApiPaginationMetaProp = {
    to: number;
    from: number;
    path: string;
    total: number;
    per_page: number;
    last_page: number;
    current_page: number;
    links: {
        active: boolean;
        label: string;
        url: string;
    };
    [key: string]: string | number | boolean | object | Array<unknown>;
};

export type ApiResponseHeaders = {
    [key: string]: string;
};

interface BaseResponse {
    status: number;
    headers: ApiResponseHeaders;
    response: XMLHttpRequest;
}

export interface PaginationData<T, M = object> {
    data: Array<T>;
    meta: ApiPaginationMetaProp & M;
}

export interface ApiResponse<T, M = object> extends BaseResponse {
    data: PaginationData<T, M>;
}

export interface ApiResponseSingle<T, M = unknown> extends BaseResponse {
    data: { data: T } & M;
}

export interface ResponseProp<T> extends BaseResponse {
    data: { data: T | Array<T> };
}

export interface ResponseErrorData {
    [key: string]: Array<string>;
}

export interface ResponseError<
    T = { title?: string; message: string; errors: ResponseErrorData; meta?: { title?: string; message?: string } },
> extends BaseResponse {
    data: T;
}

export interface ResponseErrorThrottled<T = { meta: { title: string; message: string } }> extends BaseResponse {
    data: T;
}

export interface ResponseSimple<T> extends BaseResponse {
    data: T;
}

export type RequestConfigData = {
    responseType?: XMLHttpRequestResponseType;
    onProgress?: (e: { progress: number }, xhr: XMLHttpRequest) => void;
    headers?: { [key: string]: string };
    onXhr?: (xhr: XMLHttpRequest) => void;
    body?: string | FormData;
    onAbort?: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null;
};

export type RequestConfig = ((config: RequestConfigData) => RequestConfigData) | RequestConfigData;

export default ApiResponse;
