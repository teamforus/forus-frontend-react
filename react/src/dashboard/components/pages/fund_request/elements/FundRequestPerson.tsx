import Organization from '../../../../props/models/Organization';
import usePushDanger from '../../../../hooks/usePushDanger';
import useSetProgress from '../../../../hooks/useSetProgress';
import React, { useCallback, useState } from 'react';
import { useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';
import { useTranslation } from 'react-i18next';
import FundRequest from '../../../../props/models/FundRequest';

type FundRequestLocal = FundRequest & { bsn_expanded?: boolean };

export default function FundRequestPerson({
    request,
    organization,
}: {
    request: FundRequest;
    organization: Organization;
}) {
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const [fundRequest, setFundRequest] = useState<FundRequestLocal>(request);
    const [fetchingPerson, setFetchingPerson] = useState(null);
    const fundRequestService = useFundRequestValidatorService();

    const { t } = useTranslation();

    const closePerson = useCallback(() => {
        setFundRequest((fundRequest) => ({ ...fundRequest, bsn_expanded: false }));
    }, []);

    const setBreadcrumbs = (fundRequest: FundRequestLocal) => {
        fundRequest.person_breadcrumbs = [
            fundRequest.person,
            fundRequest.person_relative ? fundRequest.person_relative : null,
        ].filter((item) => item);
    };

    const fetchPerson = useCallback(
        (fundRequest: FundRequestLocal, scope?: string, scope_id?: number) => {
            const fetchingRelative = scope && scope_id;
            const data = fetchingRelative ? { scope, scope_id } : {};

            if (fetchingPerson) {
                return;
            }

            if (!fetchingRelative && fundRequest.person) {
                setFundRequest(() => ({
                    ...fundRequest,
                    bsn_expanded: true,
                    person_relative: null,
                }));
                return setBreadcrumbs(fundRequest);
            }

            setFetchingPerson(true);
            setProgress(0);

            fundRequestService
                .getPersonBsn(organization.id, fundRequest.id, data)
                .then(
                    (res) => {
                        if (fetchingRelative) {
                            fundRequest.person_relative = res.data.data;
                        } else {
                            fundRequest.person = res.data.data;
                        }

                        fundRequest.bsn_expanded = true;
                        setBreadcrumbs(fundRequest);
                    },
                    (res) => {
                        pushDanger('Mislukt', res.data.message);
                    },
                )
                .finally(() => {
                    setFetchingPerson(false);
                    setProgress(100);
                });
        },
        [fetchingPerson, fundRequestService, organization.id, pushDanger, setProgress],
    );

    return (
        <div>
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex flex-vertical flex-center">
                        <div className="card-heading text-muted text-muted-dark">Persoonlijke gegevens &nbsp;</div>
                    </div>
                    <div className="flex flex-col flex-end">
                        {fundRequest.bsn_expanded ? (
                            <button
                                className="button button-default button-sm"
                                disabled={fetchingPerson}
                                onClick={closePerson}>
                                <div className="mdi mdi-close icon-start" />
                                Close
                            </button>
                        ) : (
                            <button
                                className="button button-primary button-sm"
                                disabled={fetchingPerson}
                                onClick={() => fetchPerson(fundRequest)}>
                                {fetchingPerson ? (
                                    <div className="mdi mdi-reload mdi-spin icon-start" />
                                ) : (
                                    <div className="mdi mdi-eye icon-start" />
                                )}
                                Bekijken
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {fundRequest.person && fundRequest.bsn_expanded && (
                <div className="card-section">
                    <div className="arrow-box border bg-dim">
                        <div className="arrow" />
                    </div>
                    <div className="block block-breadcrumbs">
                        {fundRequest.person_breadcrumbs.map((breadcrumb, index) => (
                            <div
                                key={index}
                                className={`breadcrumb-item ${
                                    index == fundRequest.person_breadcrumbs.length - 1 ? 'active' : ''
                                }`}
                                onClick={(e) => (index == 0 ? fetchPerson(fundRequest) : e.preventDefault())}>
                                {breadcrumb.name}
                            </div>
                        ))}
                    </div>
                    <div className="row">
                        <div className="col col-lg-6 col-sm-12">
                            <div className="card-block card-block-keyvalue">
                                {(fundRequest?.person_relative || fundRequest.person).fields.map((field, index) => (
                                    <div key={index} className="keyvalue-item">
                                        <div className="keyvalue-key">{field.label}</div>
                                        <div
                                            className={`keyvalue-value text-pre-line ${
                                                field.value == null ? 'text-muted' : ''
                                            }`}>
                                            {field?.value || 'Geen data'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col col-lg-6 col-sm-12">
                            {!fundRequest.person_relative &&
                                Object.keys(fundRequest.person?.relations).map(
                                    (relationsListKey: 'parents' | 'partners' | 'children') => (
                                        <div key={relationsListKey} className="card-block card-block-keyvalue">
                                            {fundRequest.person?.relations[relationsListKey].map(
                                                (relation, index: number) => (
                                                    <div key={index} className="keyvalue-item">
                                                        <div className="keyvalue-key">
                                                            {t(
                                                                `validation_requests.person.relations.${relationsListKey}`,
                                                                {
                                                                    index: index + 1,
                                                                },
                                                            )}
                                                        </div>
                                                        <a
                                                            className="keyvalue-value card-text-link"
                                                            onClick={(e) => {
                                                                e?.preventDefault();
                                                                fetchPerson(
                                                                    fundRequest,
                                                                    relationsListKey,
                                                                    relation.index,
                                                                );
                                                            }}>
                                                            {relation.name}
                                                        </a>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ),
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
