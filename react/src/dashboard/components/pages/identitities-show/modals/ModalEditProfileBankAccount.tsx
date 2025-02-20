import React, { Fragment } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import usePushApiError from '../../../../hooks/usePushApiError';
import { ResponseError } from '../../../../props/ApiResponses';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import Modal from '../../../modals/elements/Modal';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import FormGroup from '../../../elements/forms/controls/FormGroup';
import useTranslate from '../../../../hooks/useTranslate';

export default function ModalEditProfileBankAccount({
    id,
    modal,
    onDone,
    identity,
    organization,
}: {
    id?: number;
    modal: ModalState;
    onDone: () => void;
    identity: SponsorIdentity;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const pushApiError = usePushApiError();
    const bankAccount = id ? identity.bank_accounts.find((account) => account.id === id) : null;

    const form = useFormBuilder<{ id?: number; iban?: string; name?: string }>(
        { id: bankAccount?.id, name: bankAccount?.name, iban: bankAccount?.iban },

        (values) => {
            const { id, iban, name } = values;
            const data = { id, iban, name };

            setProgress(0);

            (id
                ? sponsorIdentitiesService.updateBankAccount(organization.id, identity.id, id, data)
                : sponsorIdentitiesService.storeBankAccount(organization.id, identity.id, data)
            )
                .then(() => {
                    onDone?.();
                    modal.close();
                })
                .catch((res: ResponseError) => {
                    form.setErrors(res.data.errors);
                    pushApiError(res);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { submit: formSubmit } = form;

    return (
        <Modal
            modal={modal}
            title={id ? 'Edit bank account' : 'Add bank account'}
            onSubmit={formSubmit}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Cancel
                    </button>
                    <button type="submit" className="button button-primary">
                        Submit
                    </button>
                </Fragment>
            }>
            <FormGroup
                inline={true}
                inlineSize={'lg'}
                label={translate('identities.bank_account.iban_name.label')}
                error={form.errors.name}
                input={(id) => (
                    <FormGroupInfo info={translate('identities.bank_account.iban_name.tooltip')}>
                        <input
                            id={id}
                            type={'text'}
                            className="form-control"
                            defaultValue={form.values.name || ''}
                            placeholder={translate('identities.bank_account.iban_name.label')}
                            onChange={(e) => form.update({ name: e.target.value })}
                        />
                    </FormGroupInfo>
                )}
            />

            <FormGroup
                inline={true}
                inlineSize={'lg'}
                label={translate('identities.bank_account.iban.label')}
                error={form.errors.iban}
                input={(id) => (
                    <FormGroupInfo info={translate('identities.bank_account.iban.tooltip')}>
                        <input
                            id={id}
                            type={'text'}
                            className="form-control"
                            defaultValue={form.values.iban || ''}
                            placeholder={translate('identities.bank_account.iban.label')}
                            onChange={(e) => form.update({ iban: e.target.value })}
                        />
                    </FormGroupInfo>
                )}
            />
        </Modal>
    );
}
