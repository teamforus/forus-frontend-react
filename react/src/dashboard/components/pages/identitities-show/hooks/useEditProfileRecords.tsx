import React, { useCallback } from 'react';
import SponsorIdentity, { ProfileRecordType } from '../../../../props/models/Sponsor/SponsorIdentity';
import ModalEditProfileRecords, { GroupType } from '../modals/ModalEditProfileRecords';
import useOpenModal from '../../../../hooks/useOpenModal';
import RecordType from '../../../../props/models/RecordType';
import Organization from '../../../../props/models/Organization';

export default function useEditProfileRecords(
    activeOrganization: Organization,
    recordTypes: Array<RecordType & { key: ProfileRecordType }>,
) {
    const openModal = useOpenModal();

    return useCallback(
        (
            identity: SponsorIdentity,
            title: string,
            group: GroupType,
            onDone?: () => void,
            disabledFields: Array<{ label: string; value: string; key: string }> = [],
        ) => {
            openModal((modal) => (
                <ModalEditProfileRecords
                    modal={modal}
                    title={title}
                    disabledFields={disabledFields}
                    onDone={onDone}
                    identity={identity}
                    group={group}
                    recordTypes={recordTypes}
                    organization={activeOrganization}
                    bodyOverflowVisible={false}
                />
            ));
        },
        [openModal, activeOrganization, recordTypes],
    );
}
