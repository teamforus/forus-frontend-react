import EnvDataProp from '../../props/EnvData';

export default class EventStreamService {
    protected static host = '';
    protected static envData: EnvDataProp = null;

    public static setEnvData(envData: EnvDataProp) {
        EventStreamService.envData = envData;
    }

    public static setHost(host: string) {
        EventStreamService.host = host;
    }

    /**
     * Get API url
     */
    public static getHost() {
        let host = EventStreamService.host;

        while (host[host.length - 1] === '/') {
            host = host.slice(0, host.length - 1);
        }

        return host;
    }

    /**
     * Open SSE stream
     *
     * @param endpoint - relative endpoint (bv. `/sessions/{id}/events`)
     * @param withCredentials - default true
     */
    public open(endpoint: string, withCredentials: boolean = true): EventSource {
        const url = `${EventStreamService.getHost()}${endpoint}`;
        return new EventSource(url, { withCredentials: withCredentials });
    }
}
