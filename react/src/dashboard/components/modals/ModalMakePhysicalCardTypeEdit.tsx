import React, { Fragment, useCallback, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import usePushApiError from '../../hooks/usePushApiError';
import Modal from './elements/Modal';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormPane from '../elements/forms/elements/FormPane';
import { usePhysicalCardTypeService } from '../../services/PhysicalCardTypeService';
import PhysicalCardType from '../../props/models/PhysicalCardType';
import PhotoSelector from '../elements/photo-selector/PhotoSelector';
import Media from '../../props/models/Media';
import { useMediaService } from '../../services/MediaService';
import Organization from '../../props/models/Organization';

export default function ModalMakePhysicalCardTypeEdit({
    modal,
    title,
    className,
    organization,
    physicalCardType,
    onPhysicalCardType,
}: {
    modal: ModalState;
    title?: string;
    className?: string;
    organization: Organization;
    physicalCardType?: PhysicalCardType;
    onPhysicalCardType: (physicalCardType?: PhysicalCardType) => void;
}) {
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const [media, setMedia] = useState<Media>(null);
    const [mediaFile, setMediaFile] = useState<Blob>(null);

    const mediaService = useMediaService();
    const physicalCardTypeService = usePhysicalCardTypeService();

    const form = useFormBuilder<{
        name: string;
        description: string;
        code_blocks: string;
        code_block_size: string;
    }>(
        {
            name: physicalCardType?.name || '',
            description: physicalCardType?.description || '',
            code_blocks: physicalCardType?.code_blocks?.toString() || '4',
            code_block_size: physicalCardType?.code_block_size?.toString() || '4',
        },
        (values) => {
            uploadMedia().then((media_uid: string) => {
                setProgress(0);
                setProgress(0);

                const data = {
                    ...values,
                    media_uid,
                    code_blocks: parseInt(values.code_blocks),
                    code_block_size: parseInt(values.code_block_size),
                };

                const promise = physicalCardType
                    ? physicalCardTypeService.update(physicalCardType.organization_id, physicalCardType.id, data)
                    : physicalCardTypeService.store(organization.id, data);

                promise
                    .then((res) => {
                        onPhysicalCardType(res?.data?.data);
                        modal.close();
                    })
                    .catch((err: ResponseError) => {
                        form.setErrors(err?.data?.errors);
                        form.setIsLocked(false);
                        pushApiError(err);
                    })
                    .finally(() => setProgress(100));
            });
        },
    );

    const uploadMedia = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!mediaFile) {
                return resolve(media?.uid);
            }

            setProgress(0);

            return mediaService
                .store('physical_card_type_photo', mediaFile)
                .then((res) => {
                    setMedia(res.data.data);
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                }, reject)
                .finally(() => setProgress(100));
        });
    }, [media, mediaFile, mediaService, setProgress]);

    return (
        <Modal
            modal={modal}
            title={title}
            className={className}
            onSubmit={form.submit}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </Fragment>
            }>
            <div className="flex flex-vertical flex-gap">
                <FormPane title={'Card preview'}>
                    <PhotoSelector
                        type={'physical_card_type_photo'}
                        thumbnail={physicalCardType?.photo?.sizes?.thumbnail}
                        selectPhoto={setMediaFile}
                    />
                </FormPane>
                <FormPane title={'Card details'}>
                    <FormGroup
                        label={'Card name'}
                        info={'Add a name for the card'}
                        error={form.errors?.name}
                        input={(id) => (
                            <input
                                id={id}
                                className={'form-control'}
                                value={form.values.name}
                                placeholder={'Add card name'}
                                onChange={(e) => form.update({ name: e.target.value })}
                            />
                        )}
                    />
                    <FormGroup
                        label={'Additional information on the card'}
                        info={'Add additional information on the card'}
                        error={form.errors?.description}
                        input={(id) => (
                            <textarea
                                id={id}
                                className={'form-control'}
                                defaultValue={form.values.description}
                                placeholder={'Add additional information on the card'}
                                rows={3}
                                style={{ resize: 'vertical' }}
                                onChange={(e) => form.update({ description: e.target.value })}
                            />
                        )}
                    />

                    <div className="row">
                        <div className="col col-sm-6 col-xs-12">
                            <FormGroup
                                label={'The number of numeric blocks in the code'}
                                error={form.errors?.code_blocks}
                                info={'The number of numeric blocks in the code'}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type={'number'}
                                        min={1}
                                        max={100}
                                        step={1}
                                        className={'form-control'}
                                        disabled={!!physicalCardType}
                                        value={form.values.code_blocks}
                                        placeholder={'length of the code'}
                                        onChange={(e) => form.update({ code_blocks: e.target.value })}
                                    />
                                )}
                            />
                        </div>
                        <div className="col col-sm-6 col-xs-12">
                            <FormGroup
                                label={'The size of the numeric block in the code'}
                                error={form.errors?.code_block_size}
                                info={'The size of the numeric block in the code'}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type={'number'}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className={'form-control'}
                                        disabled={!!physicalCardType}
                                        value={form.values.code_block_size}
                                        placeholder={'number of segments in the code'}
                                        onChange={(e) => form.update({ code_block_size: e.target.value })}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </FormPane>
            </div>
        </Modal>
    );
}
