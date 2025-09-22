import FormBuilder from '../../../../../types/FormBuilder';
import React from 'react';
import FormPane from '../../../../elements/forms/elements/FormPane';
import FormGroup from '../../../../elements/forms/elements/FormGroup';

export default function HouseholdMembers({
    form,
}: {
    form: FormBuilder<
        Partial<{
            count_people: number;
            count_minors: number;
            count_adults: number;
            uid: string;
        }>
    >;
}) {
    return (
        <FormPane title={'Residents'}>
            <FormGroup
                label={'Household ID'}
                required={true}
                info={'The household ID is used to identify the household in the system.'}
                error={form.errors?.uid}
                input={(id) => (
                    <input
                        id={id}
                        type="text"
                        className={'form-control'}
                        placeholder={'Household ID'}
                        value={form.values.uid ?? ''}
                        onChange={(e) => form.update({ uid: e.target.value })}
                    />
                )}
            />
            <FormGroup
                label={'Number of Members'}
                error={form.errors?.count_people}
                info={'The number of members in the household.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Number of people'}
                        value={form.values.count_people ?? ''}
                        onChange={(e) => form.update({ count_people: parseInt(e.target.value) })}
                    />
                )}
            />

            <FormGroup
                label={'Number of Minors'}
                error={form.errors?.count_minors}
                info={'The number of minors in the household.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Number of minors'}
                        value={form.values.count_minors ?? ''}
                        onChange={(e) => form.update({ count_minors: parseInt(e.target.value) })}
                    />
                )}
            />

            <FormGroup
                label={'Number of Adults'}
                error={form.errors?.count_adults}
                info={'The number of adults in the household.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Number of adults'}
                        value={form.values.count_adults ?? ''}
                        onChange={(e) => form.update({ count_adults: parseInt(e.target.value) })}
                    />
                )}
            />
        </FormPane>
    );
}
