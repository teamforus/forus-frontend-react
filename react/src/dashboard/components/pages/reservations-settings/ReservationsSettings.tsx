import React, { Fragment, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useOrganizationService } from '../../../services/OrganizationService';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useUpdateActiveOrganization from '../../../hooks/useUpdateActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import FormError from '../../elements/forms/errors/FormError';
import { hasPermission } from '../../../helpers/utils';
import ReservationFieldsEditor from '../reservations/elements/ReservationFieldsEditor';
import useSetProgress from '../../../hooks/useSetProgress';
import { uniqueId } from 'lodash';
import { ResponseError } from '../../../props/ApiResponses';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ReservationsSettings() {
    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();
    const updateActiveOrganization = useUpdateActiveOrganization();

    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const organizationService = useOrganizationService();

    const [fields, setFields] = useState(
        activeOrganization.reservation_fields.map((item) => ({ ...item, uid: uniqueId() })),
    );

    const [reservationFieldOptions] = useState([
        { value: 'no', label: 'Nee' },
        { value: 'optional', label: 'Optioneel' },
        { value: 'required', label: 'Verplicht' },
    ]);

    const [extraPaymentsOptions] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const form = useFormBuilder(
        {
            reservation_phone: activeOrganization.reservation_phone,
            reservation_address: activeOrganization.reservation_address,
            reservation_birth_date: activeOrganization.reservation_birth_date,
            reservation_allow_extra_payments: activeOrganization.reservation_allow_extra_payments,
        },
        (values) => {
            setProgress(0);

            organizationService
                .updateReservationFields(activeOrganization.id, { ...values, fields })
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    updateActiveOrganization(res.data.data);
                    setFields(res.data.data.reservation_fields.map((item) => ({ ...item, uid: uniqueId() })));

                    form.update({
                        reservation_phone: res.data.data.reservation_phone,
                        reservation_address: res.data.data.reservation_address,
                        reservation_birth_date: res.data.data.reservation_birth_date,
                        reservation_allow_extra_payments: res.data.data.reservation_allow_extra_payments,
                    });
                    form.setErrors({});
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    if (!activeOrganization) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'reservations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className={'breadcrumb-item'}>
                    Reserveringen
                </StateNavLink>
                <div className="breadcrumb-item active">Reservering instellingen</div>
            </div>
            <form className="card form" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="flex flex-grow card-title">{translate('reservation_settings.header.title')}</div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <button className="button button-primary button-sm" type="submit">
                                {translate('reservation_settings.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary card-section-settings">
                    <div className="row">
                        <div className="col-xs-12 col-lg-8">
                            <div className="form-group form-group-inline">
                                <label className="form-label" htmlFor="reservation_phone">
                                    {translate('reservation_settings.labels.phone')}
                                </label>
                                <div className="form-offset">
                                    <SelectControl
                                        value={form.values.reservation_phone}
                                        propKey={'value'}
                                        propValue={'label'}
                                        onChange={(value: 'no' | 'optional' | 'required') =>
                                            form.update({ reservation_phone: value })
                                        }
                                        options={reservationFieldOptions}
                                        optionsComponent={SelectControlOptions}
                                    />
                                    <FormError error={form.errors.reservation_phone} />
                                </div>
                            </div>
                            <div className="form-group form-group-inline">
                                <label className="form-label" htmlFor="reservation_address">
                                    {translate('reservation_settings.labels.address')}
                                </label>
                                <div className="form-offset">
                                    <SelectControl
                                        value={form.values.reservation_address}
                                        propKey={'value'}
                                        propValue={'label'}
                                        onChange={(value: 'no' | 'optional' | 'required') =>
                                            form.update({ reservation_address: value })
                                        }
                                        options={reservationFieldOptions}
                                        optionsComponent={SelectControlOptions}
                                    />
                                    <FormError error={form.errors.reservation_address} />
                                </div>
                            </div>

                            <div className="form-group form-group-inline">
                                <label className="form-label" htmlFor="reservation_birth_date">
                                    {translate('reservation_settings.labels.birth_date')}
                                </label>
                                <div className="form-offset">
                                    <SelectControl
                                        value={form.values.reservation_birth_date}
                                        propKey={'value'}
                                        propValue={'label'}
                                        onChange={(value: 'no' | 'optional' | 'required') =>
                                            form.update({ reservation_birth_date: value })
                                        }
                                        options={reservationFieldOptions}
                                        optionsComponent={SelectControlOptions}
                                    />
                                    <FormError error={form.errors.reservation_birth_date} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="form-group form-group-inline">
                        <label className="form-label">{translate('reservation_settings.labels.fields')}</label>
                        <div className="form-offset">
                            <ReservationFieldsEditor fields={fields} onChange={setFields} errors={form.errors} />
                        </div>
                    </div>
                </div>

                {activeOrganization.can_receive_extra_payments &&
                    hasPermission(activeOrganization, 'manage_payment_methods') && (
                        <div className="card-section card-section-primary card-section-settings">
                            <div className="row">
                                <div className="col-xs-12 col-lg-8">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label" htmlFor="reservation_birth_date">
                                            {translate('reservation_settings.labels.extra_payments')}
                                        </label>
                                        <div className="form-offset">
                                            <SelectControl
                                                value={form.values.reservation_allow_extra_payments}
                                                propKey={'value'}
                                                propValue={'label'}
                                                onChange={(value: boolean) =>
                                                    form.update({ reservation_allow_extra_payments: value })
                                                }
                                                options={extraPaymentsOptions}
                                                optionsComponent={SelectControlOptions}
                                            />
                                            <FormError error={form.errors.reservation_allow_extra_payments} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                <div className="card-section card-section-primary">
                    <div className="button-group flex-center">
                        <StateNavLink
                            name={'reservations'}
                            params={{ organizationId: activeOrganization.id }}
                            className="button button-default">
                            {translate('reservation_settings.buttons.cancel')}
                        </StateNavLink>
                        <button className="button button-primary" type="submit">
                            {translate('reservation_settings.buttons.confirm')}
                        </button>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
