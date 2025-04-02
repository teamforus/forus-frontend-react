import Media from '../../../../props/models/Media';

export default interface PhotoSelectorData {
    overlay_type: string;
    overlay_enabled: boolean;
    overlay_opacity: string;
    mediaLoading: boolean;
    media?: Media;
    banner_color?: string;
    banner_background?: string;
    banner_background_mobile?: boolean;
    banner_position?: 'left' | 'center' | 'right';
    banner_collapse?: boolean;
    banner_wide?: boolean;
    banner_button_type?: 'color' | 'white';
}
