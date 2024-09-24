import React, { useCallback, useEffect, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import Organization from '../../../../../props/models/Organization';
import { useOrganizationService } from '../../../../../services/OrganizationService';
import useTranslate from '../../../../../hooks/useTranslate';
import SignUpFooter from '../../../../../../webshop/components/elements/sign-up/SignUpFooter';

export default function SignUpStepOrganizationSelect({
    panelType,
    onOrganizationAdd,
    onOrganizationSelect,
    onStepBack,
}: {
    panelType: 'sponsor' | 'validator';
    onOrganizationAdd: () => void;
    onOrganizationSelect: (organization: Organization) => void;
    onStepBack: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const organizationService = useOrganizationService();

    const [organizationsList, setOrganizationsList] = useState<Array<Organization>>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization>(null);

    const loadOrganizations = useCallback(() => {
        return new Promise<Array<Organization>>((resolve, reject) =>
            organizationService.list().then((res) => {
                setOrganizationsList(res.data.data);
                resolve(res.data.data);
            }, reject),
        );
    }, [organizationService]);

    const selectOrganization = useCallback(
        (organization: Organization) => {
            setSelectedOrganization(organization);
            onOrganizationSelect(organization);
        },
        [onOrganizationSelect],
    );

    const addOrganization = useCallback(() => {
        onOrganizationAdd();
    }, [onOrganizationAdd]);

    const back = useCallback(() => {
        onStepBack();
    }, [onStepBack]);

    useEffect(() => {
        loadOrganizations().then((organizations) => {
            if (organizations.length == 0) {
                onOrganizationAdd();
            }
        });
    }, [loadOrganizations, onOrganizationAdd]);

    return (
        <div className="sign_up-pane">
            <div className="sign_up-pane-header">
                {translate(`sign_up_${panelType}.header.title_step_${panelType == 'sponsor' ? 3 : 4}`)}
            </div>

            <div className="sign_up-pane-body">
                <div className="sign_up-pane-text">
                    {translate(`sign_up_${panelType}.header.subtitle_step_${panelType == 'sponsor' ? 3 : 4}`)}
                </div>
                <br />
                <div className="sign_up-organizations">
                    {organizationsList?.map((organization) => (
                        <div
                            key={organization.id}
                            className={`sign_up-organization ${
                                organization.id == selectedOrganization?.id ? 'active' : ''
                            }`}
                            onClick={() => selectOrganization(organization)}>
                            <div className="sign_up-organization-logo">
                                <img
                                    src={
                                        organization.logo?.sizes?.thumbnail ||
                                        assetUrl('./assets/img/organization-no-logo.svg')
                                    }
                                    alt={''}
                                />
                            </div>
                            <div className="sign_up-organization-title">{organization.name}</div>
                        </div>
                    ))}
                </div>

                <div
                    className="button button-primary-outline button-fill visible-sm visible-xs"
                    onClick={addOrganization}>
                    <div className="mdi mdi-plus-circle-outline icon-start" />
                    {translate(`sign_up_${panelType}.buttons.organization_add`)}
                </div>
            </div>

            <div className="sign_up-pane-body visible-md visible-lg">
                <div className="button button-primary-outline" onClick={addOrganization}>
                    <div className="mdi mdi-plus-circle-outline icon-start" />
                    {translate(`sign_up_${panelType}.buttons.organization_add`)}
                </div>
            </div>

            <SignUpFooter
                startActions={
                    <button
                        className="button button-text button-text-padless"
                        type={'button'}
                        onClick={back}
                        tabIndex={0}>
                        <em className="mdi mdi-chevron-left icon-lefts" />
                        {translate(`sign_up_${panelType}.buttons.back`)}
                    </button>
                }
            />
        </div>
    );
}
