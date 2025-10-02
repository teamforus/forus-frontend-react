import Media from '../../../dashboard/props/models/Media';

export default interface ImplementationPageBlock {
    id: number;
    label: string;
    title: string;
    description: string;
    description_html: string;
    button_text: string;
    button_link: string;
    button_target_blank: boolean;
    button_enabled: boolean;
    button_link_label: string;
    media: Media;
}
