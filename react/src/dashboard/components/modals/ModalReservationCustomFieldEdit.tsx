import React, { Fragment, useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormGroup from '../elements/forms/elements/FormGroup';
import Reservation from '../../props/models/Reservation';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import useSetProgress from '../../hooks/useSetProgress';
import Modal from './elements/Modal';
import { ReservationCustomFieldLocal } from '../pages/reservations-view/elements/panes/ReservationExtraInformationPane';
import SelectControl from '../elements/select-control/SelectControl';
import FileUploader from '../../../webshop/components/elements/file-uploader/FileUploader';

export default function ModalReservationCustomFieldEdit({
    modal,
    field,
    onDone,
    organization,
    reservation,
}: {
    modal: ModalState;
    field: ReservationCustomFieldLocal;
    onDone?: (reservation: Reservation) => void;
    organization: Organization;
    reservation: Reservation;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const productReservationService = useProductReservationService();

    const customFieldBooleanOptions = useMemo(() => {
        return [
            { key: null, name: translate('form.placeholders.select_option') },
            { key: 'Nee', name: 'Nee' },
            { key: 'Ja', name: 'Ja' },
        ];
    }, [translate]);

    const form = useFormBuilder<{ value: string }>({ value: field.value }, (values) => {
        setProgress(0);

        productReservationService
            .updateCustomField(organization.id, reservation.id, field.id, values)
            .then((res) => {
                pushSuccess('Opgeslagen!');
                onDone?.(res.data.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                form.setErrors(err?.data?.errors);
                form.setIsLocked(false);
                pushApiError(err);
            })
            .finally(() => {
                setProgress(100);
            });
    });

    return (
        <Modal
            modal={modal}
            title={translate('modals.modal_reservation_custom_field_edit.title')}
            onSubmit={form.submit}
            footer={
                <Fragment>
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        text={translate('modals.modal_reservation_custom_field_edit.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        dusk="submitBtn"
                        text={translate('modals.modal_reservation_custom_field_edit.buttons.confirm')}
                    />
                </Fragment>
            }>
            <FormGroup
                label={field.label}
                error={form.errors?.value}
                info={field.type === 'file' ? null : field.description}
                input={(id) => (
                    <Fragment>
                        {field.type === 'text' && (
                            <input
                                id={id}
                                className="form-control"
                                value={form.values.value || ''}
                                onChange={(e) => form.update({ value: e.target.value })}
                            />
                        )}
                        {field.type === 'number' && (
                            <input
                                className="form-control"
                                type="number"
                                pattern="[0-9]+"
                                max={999999999999999}
                                value={form.values.value || ''}
                                onChange={(e) => form.update({ value: e.target.value })}
                            />
                        )}
                        {field.type === 'boolean' && (
                            <SelectControl
                                propKey={'key'}
                                value={form.values.value}
                                onChange={(value: string) => form.update({ value })}
                                options={customFieldBooleanOptions}
                            />
                        )}
                        {field.type === 'file' && (
                            <FileUploader
                                type="product_reservation_custom_field"
                                files={field.file ? [field.file] : []}
                                template="inline"
                                cropMedia={false}
                                allowMultiple={false}
                                hideDownloadButton={true}
                                hideInlineTitle={true}
                                acceptedFiles={['.jpg', '.jpeg', '.png']}
                                onFilesChange={({ files }) => {
                                    form.update({ value: files?.[0]?.uid || null });
                                }}
                                isRequired={field.required}
                                isWebshop={false}
                            />
                        )}
                    </Fragment>
                )}
            />
        </Modal>
    );
}
