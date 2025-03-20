import Media from './Media';
import BusinessType from './BusinessType';

export default interface OrganizationBasic {
    id: number;
    name: string;
    business_type_id: number;
    email_public: boolean;
    phone_public: boolean;
    website_public: boolean;
    email?: string;
    phone?: string;
    website?: string;
    logo?: Media;
    business_type: BusinessType;
}
