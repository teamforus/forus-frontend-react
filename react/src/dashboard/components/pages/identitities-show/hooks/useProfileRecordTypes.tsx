import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProfileRecords, ProfileRecordType } from '../../../../props/models/Sponsor/SponsorIdentity';
import RecordType from '../../../../props/models/RecordType';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useRecordTypeService } from '../../../../services/RecordTypeService';

export default function useProfileRecordTypes() {
    const setProgress = useSetProgress();
    const recordTypeService = useRecordTypeService();

    const [recordTypes, setRecordTypes] = useState<Array<RecordType & { key: ProfileRecordType }>>(null);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((map, recordType) => {
            return { ...map, [recordType.key]: recordType };
        }, {}) as ProfileRecords;
    }, [recordTypes]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list<RecordType & { key: ProfileRecordType }>()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    return {
        recordTypes,
        recordTypesByKey,
    };
}
