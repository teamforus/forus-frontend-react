import React, { Fragment, useMemo, useState } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../hooks/usePushApiError';
import Organization from '../../../../props/models/Organization';
import Modal from '../../../modals/elements/Modal';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import FormPane from '../../../elements/forms/elements/FormPane';
import SelectControl from '../../../elements/select-control/SelectControl';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import { ResponseError } from '../../../../props/ApiResponses';
import IdentityRecordKeyValueWithHistory from '../elements/IdentityRecordKeyValueWithHistory';
import CardBlockKeyValue from '../../../elements/card/blocks/CardBlockKeyValue';
import useProfileRecordTypes from '../hooks/useProfileRecordTypes';
import SponsorProfileRelation from '../../../../props/models/Sponsor/SponsorProfileRelation';

export default function ModalAddProfileRelation({
    modal,
    onDone,
    className,
    organization,
    identity,
    relatedIdentity,
    identityRelation,
}: {
    modal: ModalState;
    onDone?: () => void;
    className?: string;
    organization: Organization;
    identity: SponsorIdentity;
    relatedIdentity: SponsorIdentity;
    identityRelation: SponsorProfileRelation;
}) {
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const otherEmails = useMemo(() => {
        return identity?.email_verified ? identity?.email_verified : [];
    }, [identity?.email_verified]);

    const { recordTypesByKey } = useProfileRecordTypes();

    const [types] = useState([
        { value: 'partner', name: 'Partner' },
        { value: 'parent_child', name: 'Ouder-kind' },
        { value: 'housemate', name: 'Medebewoner' },
    ]);

    const [subTypes] = useState({
        partner: [
            { value: 'partner_married', name: 'Partner gehuwd' },
            { value: 'partner_registered', name: 'Partner geregistreerd' },
            { value: 'partner_unmarried', name: 'Partner ongehuwd' },
            { value: 'partner_other', name: 'Overige familierelatie (partnerschap)' },
        ],
        parent_child: [
            { value: 'parent_child', name: 'Ouder - Kind' },
            { value: 'foster_parent_foster_child', name: 'Pleegouder - Pleegkind' },
        ],
        housemate: [
            { value: 'parent', name: 'Ouder' },
            { value: 'in_law', name: 'Schoonouder' },
            { value: 'grandparent_or_sibling', name: 'Opa, oma, broer of zus' },
            { value: 'room_renter', name: 'Iemand die een kamer bij mij huurt' },
            { value: 'room_landlord', name: 'Iemand waarvan ik een kamer huur' },
            { value: 'boarder_or_host', name: 'Kostganger of kostgever' },
            { value: 'other', name: 'Anders' },
        ],
    });

    const [livingTogether] = useState([
        { value: 'true', name: 'Ja' },
        { value: 'false', name: 'Nee' },
    ]);

    const form = useFormBuilder<{
        type: string;
        subtype: string;
        living_together: string;
        related_identity_id?: number;
    }>(
        identityRelation
            ? {
                  type: identityRelation.type,
                  subtype: identityRelation.subtype,
                  living_together: identityRelation.living_together ? 'true' : 'false',
              }
            : {
                  type: 'partner',
                  subtype: 'partner_married',
                  living_together: 'false',
                  related_identity_id: relatedIdentity?.id,
              },
        (values) => {
            const data = { ...values, living_together: values.living_together === 'true' };

            const promise = identityRelation
                ? sponsorIdentitiesService.updateRelation(organization.id, identity.id, identityRelation.id, data)
                : sponsorIdentitiesService.storeRelation(organization.id, identity.id, data);

            promise
                .then(() => {
                    onDone?.();
                    modal.close();
                    pushSuccess(
                        'Gelukt!',
                        identityRelation
                            ? 'De relatie is succesvol bijgewerkt.'
                            : 'De relatie is succesvol toegevoegd.',
                    );
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data?.errors || {});
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <Modal
            title={identityRelation ? 'Bewerk relatie' : 'Voeg relatie toe'}
            className={className}
            dusk="modalHouseholds"
            size={'lg'}
            onSubmit={form.submit}
            modal={modal}
            footer={
                <div className={'button-group flex-space-between'}>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Sluiten
                    </button>

                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            }
            body={
                <div className={'modal-body'}>
                    <div className="modal-section">
                        <div className="flex flex-gap flex-vertical">
                            {!identityRelation && (
                                <FormPane title={'Gegevens van geselecteerde persoon'}>
                                    <CardBlockKeyValue
                                        size={'md'}
                                        items={[
                                            {
                                                label: recordTypesByKey?.given_name?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.given_name}
                                                    />
                                                ),
                                            },
                                            {
                                                label: recordTypesByKey?.family_name?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.family_name}
                                                    />
                                                ),
                                            },
                                            {
                                                label: recordTypesByKey?.birth_date?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.birth_date}
                                                    />
                                                ),
                                            },
                                            {
                                                label: recordTypesByKey?.gender?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.gender}
                                                    />
                                                ),
                                            },
                                            {
                                                label: recordTypesByKey?.marital_status?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.marital_status}
                                                    />
                                                ),
                                            },
                                            ...(organization.bsn_enabled
                                                ? [{ label: 'BSN', value: relatedIdentity?.bsn }]
                                                : []),
                                            {
                                                label: recordTypesByKey?.client_number?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.client_number}
                                                    />
                                                ),
                                            },
                                            { label: 'Hoofd e-mailadres', value: relatedIdentity.email },
                                            ...otherEmails.map((email, index) => ({
                                                label: `Extra e-mailadres ${index + 1}`,
                                                value: email,
                                            })),
                                            {
                                                label: recordTypesByKey?.telephone?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.telephone}
                                                    />
                                                ),
                                            },
                                            {
                                                label: recordTypesByKey?.mobile?.name,
                                                value: (
                                                    <IdentityRecordKeyValueWithHistory
                                                        records={relatedIdentity.records.mobile}
                                                    />
                                                ),
                                            },
                                        ]}
                                    />
                                </FormPane>
                            )}

                            <FormPane title={'Relatie'}>
                                <FormGroup
                                    label={'Relatie type'}
                                    error={form.errors?.type}
                                    info={<Fragment>Selecteer het type relatie tussen de twee personen.</Fragment>}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            value={form.values.type || ''}
                                            propKey={'value'}
                                            propValue={'name'}
                                            options={types}
                                            multiline={true}
                                            onChange={(value: string) => {
                                                form.update({ type: value, subtype: subTypes[value][0]?.value || '' });
                                            }}
                                        />
                                    )}
                                />

                                {subTypes[form.values.type]?.length > 0 && (
                                    <FormGroup
                                        label={'Relatie type specificatie'}
                                        error={form.errors?.subtype}
                                        info={<Fragment>Selecteer de specificatie van de relatie.</Fragment>}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                value={form.values.subtype || ''}
                                                propKey={'value'}
                                                propValue={'name'}
                                                options={subTypes[form.values.type || '']}
                                                multiline={true}
                                                onChange={(value: string) => form.update({ subtype: value })}
                                            />
                                        )}
                                    />
                                )}
                                <FormGroup
                                    label={'Samenwonend'}
                                    error={form.errors?.living_together}
                                    info={<Fragment>Selecteer of de twee personen samenwonend zijn.</Fragment>}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            value={form.values.living_together || ''}
                                            propKey={'value'}
                                            propValue={'name'}
                                            options={livingTogether}
                                            multiline={true}
                                            onChange={(value: string) => form.update({ living_together: value })}
                                        />
                                    )}
                                />
                            </FormPane>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
