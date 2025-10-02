import React, { Fragment } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import Organization from '../../../../props/models/Organization';
import useHouseholdsService from '../../../../services/HouseholdsService';
import Household from '../../../../props/models/Sponsor/Household';
import Modal from '../../../modals/elements/Modal';
import HouseholdMembers from './elements/HouseholdMembers';
import HouseholdAddress from './elements/HouseholdAddress';

export default function ModalEditHousehold({
    modal,
    className,
    onChange,
    household,
    controls,
    organization,
}: {
    modal: ModalState;
    household?: Household;
    controls?: 'members' | 'address';
    className?: string;
    onChange?: (household: Household) => void;
    organization?: Organization;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const householdsService = useHouseholdsService();

    const form = useFormBuilder<{
        uid?: string;
        count_people?: number;
        count_minors?: number;
        count_adults?: number;
        city: string;
        street: string;
        house_nr: string;
        house_nr_addition: string;
        postal_code: string;
        neighborhood_name: string;
        municipality_name: string;
    }>(
        {
            uid: household?.uid ?? '',
            count_people: household?.count_people ?? null,
            count_minors: household?.count_minors ?? null,
            count_adults: household?.count_adults ?? null,
            city: household?.city ?? '',
            street: household?.street ?? '',
            house_nr: household?.house_nr ?? '',
            house_nr_addition: household?.house_nr_addition ?? '',
            postal_code: household?.postal_code ?? '',
            neighborhood_name: household?.neighborhood_name ?? '',
            municipality_name: household?.municipality_name ?? '',
        },
        (values) => {
            setProgress(0);

            const data = {
                ...(!controls || controls === 'members'
                    ? {
                          uid: values.uid,
                          count_people: values.count_people,
                          count_minors: values.count_minors,
                          count_adults: values.count_adults,
                      }
                    : {}),
                ...(!controls || controls === 'address'
                    ? {
                          city: values.city,
                          street: values.street,
                          house_nr: values.house_nr,
                          house_nr_addition: values.house_nr_addition,
                          postal_code: values.postal_code,
                          neighborhood_name: values.neighborhood_name,
                          municipality_name: values.municipality_name,
                      }
                    : {}),
            };

            const promise = household
                ? householdsService?.update(household?.organization_id, household?.id, data)
                : householdsService?.store(organization?.id, data);

            promise
                .then((res) => {
                    onChange?.(res.data.data);
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <Modal
            title="Add new household"
            className={className}
            dusk="modalHouseholds"
            onSubmit={form.submit}
            modal={modal}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Sluiten
                    </button>

                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </Fragment>
            }>
            <div className="flex flex-gap flex-vertical">
                {(!controls || controls === 'members') && <HouseholdMembers form={form} />}
                {(!controls || controls === 'address') && <HouseholdAddress form={form} />}
            </div>
        </Modal>
    );
}
