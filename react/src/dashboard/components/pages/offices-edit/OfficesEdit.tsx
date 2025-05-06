import React from 'react';
import OfficesForm from './elements/OfficesForm';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';

export default function OfficesEdit() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    return <OfficesForm organization={activeOrganization} id={id ? parseInt(id) : null} />;
}
