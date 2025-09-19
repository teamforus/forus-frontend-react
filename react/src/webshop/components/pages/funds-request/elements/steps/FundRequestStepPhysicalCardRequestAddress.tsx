import React, { FormEvent, Fragment } from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import Fund from '../../../../../props/models/Fund';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

export default function FundRequestStepPhysicalCardRequestAddress({
    errors,
    address,
    setAddress,
    progress,
    bsnWarning,
    onPrevStep,
    onSubmit,
}: {
    errors: {
        'physical_card_request_address.street'?: string;
        'physical_card_request_address.house_nr'?: string;
        'physical_card_request_address.house_nr_addition'?: string;
        'physical_card_request_address.postal_code'?: string;
        'physical_card_request_address.city'?: string;
    };
    address: {
        street?: string;
        house_nr?: string;
        house_nr_addition?: string;
        postal_code?: string;
        city?: string;
    };
    setAddress: (address: {
        street?: string;
        house_nr?: string;
        house_nr_addition?: string;
        postal_code?: string;
        city?: string;
    }) => void;
    fund: Fund;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    onPrevStep: () => void;
    onSubmit: (e: FormEvent) => void;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSubmit(e);
                    }}>
                    <h2 className="sign_up-pane-header">
                        {translate('fund_request.sign_up.fund_request_physical_card_request.title')}
                    </h2>
                    <div className="sign_up-pane-body sign_up-pane-content">
                        <div className="sign_up-pane-text flex flex-vertical flex-gap-sm">
                            <div className="sign_up-pane-text">
                                <div className="sign_up-pane-heading">
                                    {translate('fund_request.sign_up.fund_request_physical_card_request.heading')}
                                </div>
                            </div>
                            <div className="sign_up-pane-text">
                                <div className="block block-markdown">
                                    {translate('fund_request.sign_up.fund_request_physical_card_request.description')}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col col-xs-12 col-lg-6 form-group">
                                <label className="form-label form-label-required" htmlFor="application_address_street">
                                    {translate('fund_request.sign_up.fund_request_physical_card_request.labels.street')}
                                </label>
                                <input
                                    className="form-control"
                                    id="application_address_street"
                                    type="text"
                                    value={address.street || ''}
                                    onChange={(e) => setAddress({ street: e.target.value })}
                                    data-dusk="applicationAddressFormStreet"
                                />
                                <FormError error={errors?.['physical_card_request_address.street']} />
                            </div>
                            <div className="col col-xs-12 col-lg-6">
                                <div className="row">
                                    <div className="col col-xs-6 col-lg-6 form-group">
                                        <label
                                            className="form-label form-label-required"
                                            htmlFor="application_address_house_nr">
                                            {translate(
                                                'fund_request.sign_up.fund_request_physical_card_request.labels.house_nr',
                                            )}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="application_address_house_nr"
                                            type="text"
                                            value={address.house_nr || ''}
                                            onChange={(e) => setAddress({ house_nr: e.target.value })}
                                            data-dusk="applicationAddressFormHouseNumber"
                                        />
                                        <FormError error={errors?.['physical_card_request_address.house_nr']} />
                                    </div>
                                    <div className="col col-xs-6 col-lg-6 form-group">
                                        <label className="form-label" htmlFor="application_address_house_nr_addition">
                                            {translate(
                                                'fund_request.sign_up.fund_request_physical_card_request.labels.house_nr_addition',
                                            )}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="application_address_house_nr_addition"
                                            type="text"
                                            value={address.house_nr_addition || ''}
                                            onChange={(e) => setAddress({ house_nr_addition: e.target.value })}
                                            data-dusk="applicationAddressFormHouseNumberAddition"
                                        />
                                        <FormError
                                            error={errors?.['physical_card_request_address.house_nr_addition']}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col col-xs-12 col-lg-6 form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="application_address_postal_code">
                                    {translate(
                                        'fund_request.sign_up.fund_request_physical_card_request.labels.postal_code',
                                    )}
                                </label>
                                <input
                                    className="form-control"
                                    id="application_address_postal_code"
                                    type="text"
                                    value={address.postal_code || ''}
                                    onChange={(e) => setAddress({ postal_code: e.target.value })}
                                    data-dusk="applicationAddressFormPostalCode"
                                />
                                <FormError error={errors?.['physical_card_request_address.postal_code']} />
                            </div>

                            <div className="col col-xs-12 col-lg-6 form-group">
                                <label className="form-label form-label-required" htmlFor="application_address_city">
                                    {translate('fund_request.sign_up.fund_request_physical_card_request.labels.city')}
                                </label>
                                <input
                                    className="form-control"
                                    id="application_address_city"
                                    type="text"
                                    value={address.city || ''}
                                    onChange={(e) => setAddress({ city: e.target.value })}
                                    data-dusk="applicationAddressFormCity"
                                />
                                <FormError error={errors?.['physical_card_request_address.city']} />
                            </div>
                        </div>
                    </div>
                    <SignUpFooter
                        startActions={
                            <button
                                className="button button-text button-text-padless"
                                onClick={() => onPrevStep()}
                                role="button"
                                tabIndex={0}>
                                <em className="mdi mdi-chevron-left icon-left" />
                                {translate('fund_request.sign_up.pane.footer.prev')}
                            </button>
                        }
                        endActions={
                            <button
                                className="button button-text button-text-padless"
                                type="submit"
                                role="button"
                                tabIndex={0}>
                                {translate('fund_request.sign_up.pane.footer.next')}
                                <em className="mdi mdi-chevron-right icon-right" />
                            </button>
                        }
                    />

                    {bsnWarning}
                </form>
            </div>
        </Fragment>
    );
}
