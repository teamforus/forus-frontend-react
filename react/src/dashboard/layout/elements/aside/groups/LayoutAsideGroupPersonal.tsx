import React from 'react';
import Organization from '../../../../props/models/Organization';
import LayoutAsideNavGroup from '../elements/LayoutAsideNavGroup';
import { IconPersonal, IconPersonalActive } from '../icons/LayoutAsideIcons';
import ModalAuthPincode from '../../../../components/modals/ModalAuthPincode';
import useAuthIdentity2FAState from '../../../../hooks/useAuthIdentity2FAState';
import useOpenModal from '../../../../hooks/useOpenModal';

export default function LayoutAsideGroupPersonal({
    organization,
    pinnedGroups,
    setPinnedGroups,
}: {
    organization: Organization;
    pinnedGroups: Array<string>;
    setPinnedGroups: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const openModal = useOpenModal();
    const authIdentity2FAState = useAuthIdentity2FAState();

    return (
        <LayoutAsideNavGroup
            id="menu_personal_settings"
            name="Persoonlijke instellingen"
            icon={<IconPersonal />}
            iconActive={<IconPersonalActive />}
            pinnedGroups={pinnedGroups}
            setPinnedGroups={setPinnedGroups}
            items={[
                {
                    name: 'E-mail instellingen',
                    state: 'preferences-emails',
                    show: !!organization,
                },
                {
                    name: 'Beveiliging',
                    state: 'security-2fa',
                    show: organization?.allow_2fa_restrictions || authIdentity2FAState?.required,
                },
                {
                    name: 'Notificatievoorkeuren',
                    state: 'preferences-notifications',
                    show: !!organization,
                },
                {
                    name: 'Autoriseer apparaat',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        openModal((modal) => <ModalAuthPincode modal={modal} />);
                    },
                    show: !!organization,
                },
                {
                    name: 'Sessies',
                    state: 'security-sessions',
                    show: !!organization,
                },
            ]}
        />
    );
}
