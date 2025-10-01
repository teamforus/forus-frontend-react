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
        <FormPane title={'Bewoners'}>
            <FormGroup
                label={'Huishouden ID'}
                required={true}
                info={'Het ID nummer wordt als uniek nummer gebruikt om het huishouden te identificeren.'}
                error={form.errors?.uid}
                input={(id) => (
                    <input
                        id={id}
                        type="text"
                        className={'form-control'}
                        placeholder={'Huishouden ID'}
                        value={form.values.uid ?? ''}
                        onChange={(e) => form.update({ uid: e.target.value })}
                    />
                )}
            />
            <FormGroup
                label={'Aantal leden'}
                error={form.errors?.count_people}
                info={'Het aantal leden dat het huishouden heeft.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Aantal leden'}
                        value={form.values.count_people ?? ''}
                        onChange={(e) => form.update({ count_people: parseInt(e.target.value) })}
                    />
                )}
            />

            <FormGroup
                label={'Aantal kinderen'}
                error={form.errors?.count_minors}
                info={'Het aantal kinderen dat het huishouden heeft.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Aantal kinderen'}
                        value={form.values.count_minors ?? ''}
                        onChange={(e) => form.update({ count_minors: parseInt(e.target.value) })}
                    />
                )}
            />

            <FormGroup
                label={'Aantal ouders'}
                error={form.errors?.count_adults}
                info={'Het aantal ouders dat het huishouden heeft.'}
                input={(id) => (
                    <input
                        id={id}
                        type="number"
                        className={'form-control'}
                        placeholder={'Aantal ouders'}
                        value={form.values.count_adults ?? ''}
                        onChange={(e) => form.update({ count_adults: parseInt(e.target.value) })}
                    />
                )}
            />
        </FormPane>
    );
}
