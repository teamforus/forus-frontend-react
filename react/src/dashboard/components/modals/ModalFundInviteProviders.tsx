import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FormError from '../elements/forms/errors/FormError';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import { useFundService } from '../../services/FundService';
import useSetProgress from '../../hooks/useSetProgress';
import useFundProviderInvitationsService from '../../services/useFundProviderInvitationsService';
import { ResponseError } from '../../props/ApiResponses';
import FundProviderInvitation from '../../props/models/FundProviderInvitation';
import useTranslate from '../../hooks/useTranslate';

export default function ModalFundInviteProviders({
    fund,
    modal,
    onSubmit,
}: {
    fund: Fund;
    modal: ModalState;
    onSubmit?: (res: Array<FundProviderInvitation>) => void;
}) {
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const translate = useTranslate();

    const fundService = useFundService();
    const fundProviderInvitationsService = useFundProviderInvitationsService();

    const [funds, setFunds] = useState<Array<Fund>>([]);

    const form = useFormBuilder({ fund_id: null }, (values) => {
        setProgress(0);

        fundProviderInvitationsService
            .store(activeOrganization.id, fund.id, values.fund_id)
            .then((res) => {
                setProgress(100);
                onSubmit(res.data.data);
                modal.close();
            })
            .catch((err: ResponseError) => form.setErrors(err.data.errors))
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    const { update: updateForm } = form;

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { with_archived: 1 })
            .then((res) => setFunds(res.data.data.filter((item) => item.id != fund.id)))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fund.id, fundService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        if (funds.length) {
            updateForm({ fund_id: funds[0]?.id });
        }
    }, [updateForm, fund, funds]);

    return (
        <div className={`modal modal-animated modal-md ${modal.loading ? 'modal-loading' : null}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window form">
                <form className="form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">Aanbieders uitnodigen</div>
                    <div className="modal-body form">
                        <div className="modal-section">
                            <div className="row">
                                <div className="col col-lg-10 col col-lg-offset-1">
                                    <div className="form-group">
                                        <label className="form-label form-label-required">
                                            Nodig aanbieders uit van:
                                        </label>

                                        <div className="form-offset">
                                            <SelectControl
                                                className={'form-control'}
                                                options={funds}
                                                propKey={'id'}
                                                allowSearch={true}
                                                value={form.values?.fund_id}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(fund_id: number) => form.update({ fund_id })}
                                            />
                                        </div>

                                        <FormError error={form.errors?.fund_id} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-section">
                            <div className="row">
                                <div className="col col-lg-10 col col-lg-offset-1">
                                    <div className="block block-info">
                                        <em className="mdi mdi-information block-info-icon" />
                                        Deze functie nodigt alle aanbieders uit van het bovenstaande geselecteerde
                                        fonds. Uitnodigingen worden gelijk verstuurd na bevestiging.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={modal.close}>
                            {translate('modals.modal_fund_criteria_description.buttons.close')}
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestig
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
