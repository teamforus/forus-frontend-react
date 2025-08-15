type IdentitiesApiPersonRelation = {
    index: number;
    name: string;
};

type IdentitiesApiPerson = {
    name?: string;
    fields?: Array<{ label: string; value: string }>;
    relations?: {
        parents?: Array<IdentitiesApiPersonRelation>;
        partners?: Array<IdentitiesApiPersonRelation>;
        children?: Array<IdentitiesApiPersonRelation>;
    };
};

export default IdentitiesApiPerson;
