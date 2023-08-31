import React, { useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import useAppConfigs from '../../../hooks/useAppConfigs';

export default function CsvValidations() {
    const appConfigs = useAppConfigs();

    // /csv-validation/funds
    useEffect(() => {
        if (appConfigs) {
            document.location = appConfigs.fronts.url_sponsor + '/csv-validation/funds';
        }
    }, [appConfigs]);
    return <></>;
}
