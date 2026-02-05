import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import React, { Fragment, useCallback, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import IdentitiesApiPerson from '../../../../props/models/IdentitiesApiPerson';
import Card from '../../../elements/card/Card';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import classNames from 'classnames';

type Person = {
    bsn_expanded?: boolean;
    person?: IdentitiesApiPerson;
    person_relative?: IdentitiesApiPerson;
    person_breadcrumbs?: Array<IdentitiesApiPerson>;
};

export default function IdentityPerson({
    identityId,
    organization,
}: {
    identityId: number;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [person, setPerson] = useState<Person>({});
    const [fetchingPerson, setFetchingPerson] = useState(null);
    const identitiesService = useSponsorIdentitiesService();

    const closePerson = useCallback(() => {
        setPerson((person) => ({ ...person, bsn_expanded: false }));
    }, []);

    const setBreadcrumbs = (person: Person) => {
        person.person_breadcrumbs = [person.person, person.person_relative ? person.person_relative : null].filter(
            (item) => item,
        );
    };

    const fetchPerson = useCallback(
        (person: Person, scope?: string, scope_id?: number) => {
            const fetchingRelative = scope && scope_id;
            const data = fetchingRelative ? { scope, scope_id } : {};

            if (fetchingPerson) {
                return;
            }

            if (!fetchingRelative && person.person) {
                setPerson(() => ({
                    ...person,
                    bsn_expanded: true,
                    person_relative: null,
                }));
                return setBreadcrumbs(person);
            }

            setFetchingPerson(true);
            setProgress(0);

            identitiesService
                .getPersonBsn(organization.id, identityId, data)
                .then((res) => {
                    if (fetchingRelative) {
                        person.person_relative = res.data.data;
                    } else {
                        person.person = res.data.data;
                    }

                    person.bsn_expanded = true;
                    setBreadcrumbs(person);
                })
                .catch(pushApiError)
                .finally(() => {
                    setFetchingPerson(false);
                    setProgress(100);
                });
        },
        [fetchingPerson, setProgress, identitiesService, organization.id, identityId, pushApiError],
    );

    return (
        <Card
            title={'Persoonlijke gegevens'}
            buttons={[
                person.bsn_expanded
                    ? {
                          text: 'Sluiten',
                          icon: 'close',
                          disabled: fetchingPerson,
                          onClick: closePerson,
                      }
                    : {
                          type: 'primary',
                          text: 'Bekijken',
                          icon: 'format-list-bulleted',
                          disabled: fetchingPerson,
                          onClick: () => fetchPerson(person),
                      },
            ]}>
            {person.person && person.bsn_expanded ? (
                <Fragment>
                    <div className="block block-breadcrumbs">
                        {person.person_breadcrumbs.map((breadcrumb, index) => (
                            <div
                                key={index}
                                className={classNames(
                                    'breadcrumb-item',
                                    index == person.person_breadcrumbs.length - 1 && 'active',
                                )}
                                onClick={(e) => (index == 0 ? fetchPerson(person) : e.preventDefault())}>
                                {breadcrumb.name}
                            </div>
                        ))}
                    </div>
                    <div className="row">
                        <div className="col col-lg-6 col-sm-12">
                            <div className="card-block card-block-keyvalue">
                                {(person?.person_relative || person.person).fields.map((field, index) => (
                                    <div key={index} className="keyvalue-item">
                                        <div className="keyvalue-key">{field.label}</div>
                                        <div
                                            className={classNames(
                                                'keyvalue-value',
                                                'text-pre-line',
                                                field.value == null && 'text-muted',
                                            )}>
                                            {field?.value || 'Geen data'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col col-lg-6 col-sm-12">
                            {!person.person_relative &&
                                Object.keys(person.person?.relations).map(
                                    (relationsListKey: 'parents' | 'partners' | 'children') => (
                                        <div key={relationsListKey} className="card-block card-block-keyvalue">
                                            {person.person?.relations[relationsListKey].map(
                                                (relation, index: number) => (
                                                    <div key={index} className="keyvalue-item">
                                                        <div className="keyvalue-key">
                                                            {translate(
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
                                                                fetchPerson(person, relationsListKey, relation.index);
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
                </Fragment>
            ) : (
                <EmptyCard
                    title="Basisregistratie personen (BRP) gegevens"
                    description="Op basis van het BSN kunnen BRP-gegevens worden getoond van de persoon, inclusief gegevens van de partner, ouders en kinderen."
                    type={'card-section'}
                />
            )}
        </Card>
    );
}
