type FundRequestApiPersonRelation = {
    index: number;
    name: string;
};

type FundRequestApiPerson = {
    name?: string;
    fields?: Array<{ label: string; value: string }>;
    relations?: {
        parents?: Array<FundRequestApiPersonRelation>;
        partners?: Array<FundRequestApiPersonRelation>;
        children?: Array<FundRequestApiPersonRelation>;
    };
};

export default FundRequestApiPerson;
