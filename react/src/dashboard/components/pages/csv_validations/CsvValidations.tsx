import React, { useState, useCallback, useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from 'react-i18next';
import { useFundService } from '../../../services/FundService';
import FundSelector from '../../elements/fund-selector/FundSelector';
import Fund from '../../../props/models/Fund';
import { PaginationData } from '../../../props/ApiResponses';
import CSVUpload from './elements/CSVUpload';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import PrevalidatedTable from './elements/PrevalidatedTable';
import EmptyCard from '../../elements/empty-card/EmptyCard';

export default function CsvValidations() {
    const { t } = useTranslation();

    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const recordTypeService = useRecordTypeService();

    const [fund, setFund] = useState<Fund>(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const onFundSelect = useCallback((fund: Fund) => {
        setFund(fund);
    }, []);

    const fetchFunds = useCallback(async () => {
        const res = await fundService.list(activeOrganization.id, { per_page: 100, configured: 1 });
        return res.data;
    }, [activeOrganization.id, fundService]);

    const fetchRecordTypes = useCallback(() => {
        recordTypeService.list({ criteria: 1 }).then((res) => {
            return setRecordTypes(res.data);
        });
    }, [recordTypeService]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchFunds().then((funds) => {
            const activeFund = fundService.getLastSelectedFund(funds.data) || funds.data[0];

            setFunds(funds);
            setFund(activeFund);
        });
    }, [fetchFunds, fundService]);

    return (
        <>
            <div className="card-heading">{t('csv_validation.header.title')}</div>
            <FundSelector fund={fund} funds={funds?.data} onFundSelect={onFundSelect} />
            {fund?.state != 'closed' && <CSVUpload fund={fund} recordTypes={recordTypes} />}
            {fund && <PrevalidatedTable fund={fund} recordTypes={recordTypes} />}

            {funds?.meta.total == 0 && (
                <EmptyCard
                    description={'U bent geen validator voor een fonds dat actief is om aanvragers aan toe te voegen.'}
                />
            )}
        </>
    );
}
