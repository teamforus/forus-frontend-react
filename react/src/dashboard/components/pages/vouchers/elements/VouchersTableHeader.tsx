import React, { Fragment, useCallback } from 'react';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import SelectControl from '../../../elements/select-control/SelectControl';
import FilterScope from '../../../../types/FilterScope';
import useTranslate from '../../../../hooks/useTranslate';
import { PaginationData } from '../../../../props/ApiResponses';
import Voucher from '../../../../props/models/Voucher';
import Fund from '../../../../props/models/Fund';
import VouchersTableFilters, { VouchersTableFiltersProps } from './VouchersTableFilters';
import SelectControlOptionsFund from '../../../elements/select-control/templates/SelectControlOptionsFund';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalVoucherCreate from '../../../modals/ModalVoucherCreate';
import ModalVouchersUpload from '../../../modals/ModalVouchersUpload';

export default function VouchersTableHeader({
    organization,
    vouchers,
    filter,
    funds,
    loading,
    fetchVouchers,
}: {
    organization: Organization;
    vouchers: PaginationData<Voucher>;
    filter: FilterScope<VouchersTableFiltersProps>;
    funds: Array<Partial<Fund>>;
    loading: boolean;
    fetchVouchers: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const createVoucher = useCallback(
        (funds: Array<Partial<Fund>>, fundId?: number, onCreate?: () => void) => {
            const fundsList = funds.filter((fund) => fund.id);

            openModal((modal) => (
                <ModalVoucherCreate
                    fundId={fundId || fundsList[0].id}
                    funds={fundsList}
                    modal={modal}
                    onCreated={onCreate}
                    organization={organization}
                />
            ));
        },
        [openModal, organization],
    );

    const uploadVouchers = useCallback(
        (funds: Array<Partial<Fund>>, onCreate?: () => void) => {
            openModal((modal) => (
                <ModalVouchersUpload modal={modal} funds={funds} organization={organization} onCompleted={onCreate} />
            ));
        },
        [openModal, organization],
    );

    return (
        <div className={`card-header ${loading ? 'card-header-inactive' : ''}`}>
            <div className="flex">
                <div className="flex flex-grow">
                    <div className="card-title" data-dusk="vouchersTitle">
                        {translate('vouchers.header.title')} ({vouchers?.meta?.total})
                    </div>
                </div>

                <div className="flex">
                    <div className="block block-inline-filters">
                        {hasPermission(organization, 'manage_vouchers') && (
                            <Fragment>
                                <button
                                    id="create_voucher"
                                    className="button button-primary"
                                    disabled={funds?.filter((fund) => fund.id)?.length < 1}
                                    onClick={() => createVoucher(funds, filter.activeValues?.fund_id, fetchVouchers)}>
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    {translate('vouchers.buttons.add_new')}
                                </button>

                                <button
                                    id="voucher_upload_csv"
                                    className="button button-primary"
                                    disabled={funds?.filter((fund) => fund.id)?.length < 1}
                                    onClick={() => uploadVouchers(funds, fetchVouchers)}
                                    data-dusk="uploadVouchersBatchButton">
                                    <em className="mdi mdi-upload icon-start" />
                                    {translate('vouchers.buttons.upload_csv')}
                                </button>
                            </Fragment>
                        )}

                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className="form-control inline-filter-control"
                                    propKey={'id'}
                                    options={funds}
                                    value={filter.activeValues.fund_id}
                                    placeholder={translate('vouchers.labels.fund')}
                                    allowSearch={false}
                                    onChange={(fund_id: number) => filter.update({ fund_id })}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            </div>
                        </div>

                        <VouchersTableFilters
                            filter={filter}
                            organization={organization}
                            vouchers={vouchers}
                            funds={funds}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
