interface Location {
    ip: string;
    country?: string;
    city?: string;
    string?: string;
    detected: boolean;
}

interface Device {
    browser?: {
        name?: string;
        version?: string;
        type?: string;
    };
    engine?: {
        name: string;
    };
    os: {
        name?: string;
        alias?: string;
        version?: {
            value?: string;
            nickname?: string;
        };
    };
    device?: {
        type?: string;
        model?: string;
        manufacturer?: string;
    };
}

interface SessionRequest {
    time_passed?: number;
    time_passed_locale?: string;
    location: Location;
    client_type: string;
    client_version?: string;
    device_available: true;
    device_string: string;
    device: Device;
}

export default interface Session {
    uid: string;
    identity_address: string;
    active: boolean;
    current: boolean;
    started_at: string;
    started_at_locale: string;
    client_type?: string;
    client_version?: string;
    locations: Array<Location>;
    first_request: SessionRequest;
    last_request: SessionRequest;
}
