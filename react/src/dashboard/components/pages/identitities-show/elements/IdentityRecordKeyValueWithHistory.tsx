import { ProfileRecord } from '../../../../props/models/Sponsor/SponsorIdentity';
import React, { useState } from 'react';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import classNames from 'classnames';

export default function IdentityRecordKeyValueWithHistory({ records }: { records: Array<ProfileRecord> }) {
    const [show, setShow] = useState(false);

    return (
        <div className={'keyvalue-value-history'}>
            <div className="keyvalue-value-history-header">
                <span>{records?.[0]?.value || <TableEmptyValue />}</span>
                {records?.length > 1 && (
                    <span className="keyvalue-value-history-toggle" onClick={() => setShow(!show)}>
                        {`${records?.length} keer bewerkt`}
                        {show ? <em className="mdi mdi-chevron-up" /> : <em className="mdi mdi-chevron-down" />}
                    </span>
                )}
            </div>
            {show && (
                <div className="keyvalue-value-history-body">
                    {records.map((item, index) => (
                        <div className="keyvalue-value-history-body-item" key={index}>
                            <em className="mdi mdi-clock-outline" />
                            {'Gewijzigd door '}
                            <strong className={classNames('text-strong', item.employee && 'text-primary')}>
                                {item.employee ? item.employee?.email || `Medewerker[${item.employee?.id}]` : 'User'}
                            </strong>{' '}
                            {`${item.created_at_locale} • van `}
                            <strong>{`'${records[index + 1]?.value || ''}'`}</strong>
                            {' naar '}
                            <strong>{`'${item.value || ''}'`}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
