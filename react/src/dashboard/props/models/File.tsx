import Media from './Media';

export default interface File {
    uid: string;
    url?: string;
    ext?: string;
    size?: string;
    original_name?: string;
    preview?: Media;
}
