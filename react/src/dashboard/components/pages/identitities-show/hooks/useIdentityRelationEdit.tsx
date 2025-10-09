import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import Organization from '../../../../props/models/Organization';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import ModalSelectOrMakeSponsorIdentity from '../../households/modals/ModalSelectOrMakeSponsorIdentity';
import ModalAddProfileRelation from '../modals/ModalAddProfileRelation';
import SponsorProfileRelation from '../../../../props/models/Sponsor/SponsorProfileRelation';

export default function useIdentityRelationEdit(organization: Organization) {
    const openModal = useOpenModal();

    const editIdentityRelation = useCallback(
        (
            identity: SponsorIdentity,
            relatedIdentity: SponsorIdentity,
            identityRelation: SponsorProfileRelation,
            onDone: () => void,
        ) => {
            openModal((modal) => (
                <ModalAddProfileRelation
                    modal={modal}
                    identity={identity}
                    relatedIdentity={relatedIdentity}
                    identityRelation={identityRelation}
                    organization={organization}
                    onDone={onDone}
                />
            ));
        },
        [openModal, organization],
    );

    const selectIdentity = useCallback(
        (identity: SponsorIdentity, onDone: () => void) => {
            openModal((modal) => (
                <ModalSelectOrMakeSponsorIdentity
                    modal={modal}
                    onDone={(identities) => {
                        modal.close();
                        editIdentityRelation(identity, identities[0], null, onDone);
                    }}
                    multiselect={false}
                    organization={organization}
                    excludeRelation={identity}
                />
            ));
        },
        [editIdentityRelation, openModal, organization],
    );

    return useCallback(
        (identity: SponsorIdentity, relation: SponsorProfileRelation, onChange: () => void) => {
            if (relation) {
                return editIdentityRelation(identity, relation.related_identity, relation, onChange);
            }

            return selectIdentity(identity, onChange);
        },
        [editIdentityRelation, selectIdentity],
    );
}
