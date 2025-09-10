import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSetProgress from '../../../../../hooks/useSetProgress';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import useTranslate from '../../../../../hooks/useTranslate';
import Fund from '../../../../../props/models/Fund';
import { ResponseError } from '../../../../../props/ApiResponses';
import { useFundService } from '../../../../../services/FundService';
import usePushSuccess from '../../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../../hooks/usePushApiError';
import FormPane from '../../../../elements/forms/elements/FormPane';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../../elements/select-control/SelectControl';
import PhysicalCardType from '../../../../../props/models/PhysicalCardType';
import { usePhysicalCardTypeService } from '../../../../../services/PhysicalCardTypeService';

export default function FundFormPhysicalCardsCard({
    fund,
    setFund,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const physicalCardTypesService = usePhysicalCardTypeService();

    const [physicalCardTypes, setPhysicalCardTypes] = useState<Array<Partial<PhysicalCardType>>>([]);

    const [options] = useState([
        { value: false, name: 'Nee' },
        { value: true, name: 'Ja' },
    ]);

    const fetchPhysicalCardTypes = useCallback(() => {
        physicalCardTypesService
            .list(fund.organization_id, { per_page: 100, fund_id: fund?.id })
            .then((res) => setPhysicalCardTypes([{ id: null, name: 'Selecteer...' }, ...res.data.data]))
            .catch(pushApiError);
    }, [fund.organization_id, physicalCardTypesService, pushApiError, fund?.id]);

    const form = useFormBuilder<{
        fund_request_physical_card_enable: boolean;
        fund_request_physical_card_type_id?: number;
    }>(
        {
            fund_request_physical_card_enable: fund.fund_request_physical_card_enable,
            fund_request_physical_card_type_id: fund.fund_request_physical_card_type_id,
        },
        (values) => {
            setProgress(0);

            fundService
                .update(fund.organization.id, fund.id, values)
                .then(() => {
                    pushSuccess('Opgeslagen!');
                    setFund(fund);
                    form.setErrors({});
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    useEffect(() => {
        fetchPhysicalCardTypes();
    }, [fetchPhysicalCardTypes]);

    return (
        <form className="form" onSubmit={form.submit}>
            <div className="card-body">
                <div className="card-section card-section-primary">
                    <div className={'flex flex-vertical flex-gap'}>
                        <FormPane title={'Physical cards settings'}>
                            <FormGroup
                                label={'Enable in fund application process and generate physical card for applications'}
                                info={<Fragment>lorem ipsum</Fragment>}
                                error={form.errors?.fund_request_physical_card_enable}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        propKey={'value'}
                                        className={'form-control'}
                                        value={form.values.fund_request_physical_card_enable}
                                        disabled={!fund.allow_physical_cards}
                                        options={options}
                                        onChange={(fund_request_physical_card_enable: boolean) => {
                                            form.update({ fund_request_physical_card_enable });
                                        }}
                                    />
                                )}
                            />
                            {form.values.fund_request_physical_card_enable && (
                                <FormGroup
                                    label={'Select physical card type'}
                                    info={<Fragment>lorem ipsum</Fragment>}
                                    error={form.errors?.fund_request_physical_card_type_id}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            propKey={'id'}
                                            className={'form-control'}
                                            value={form.values.fund_request_physical_card_type_id}
                                            options={physicalCardTypes}
                                            onChange={(fund_request_physical_card_type_id?: number) => {
                                                form.update({ fund_request_physical_card_type_id });
                                            }}
                                        />
                                    )}
                                />
                            )}
                        </FormPane>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="button-group flex-end">
                        <button className="button button-primary" type="submit">
                            <em className="mdi mdi-content-save-outline icon-start" />
                            {translate('fund_request_configurations.buttons.submit')}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
