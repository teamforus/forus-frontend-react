import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router-dom';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import ModalNotification from '../../modals/ModalNotification';
import useOpenModal from '../../../hooks/useOpenModal';
import { useNavigateState } from '../../../modules/state_router/Router';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import FundCriteriaEditor, { FundCriterionLocal } from '../../elements/fund-criteria-editor/FundCriteriaEditor';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import { currencyFormat } from '../../../helpers/string';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import ThSortable from '../../elements/tables/ThSortable';
import FundTopUpTransaction from '../../../props/models/FundTopUpTransaction';
import Paginator from '../../../modules/paginator/components/Paginator';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import Implementation from '../../../props/models/Implementation';
import Identity from '../../../props/models/Sponsor/Identity';
import ModalFundInviteProviders from '../../modals/ModalFundInviteProviders';
import usePushSuccess from '../../../hooks/usePushSuccess';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import TableRowActions from '../../elements/tables/TableRowActions';
import useFundIdentitiesExportService from '../../../services/exports/useFundIdentitiesExportService';
import usePushDanger from '../../../hooks/usePushDanger';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';

export default function OrganizationsFundsShow() {
    const fundId = useParams().fundId;

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const organizationService = useOrganizationService();
    const fundIdentitiesExportService = useFundIdentitiesExportService();

    const [fund, setFund] = useState<Fund>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [viewType, setViewType] = useState<string>('top_ups');
    const [identitiesActive, setIdentitiesActive] = useState<number>(0);
    const [viewGeneralType, setViewGeneralType] = useState<string>('description');
    const [lastQueryIdentities, setLastQueryIdentities] = useState<string>('');
    const [lastQueryTopUpTransactions, setLastQueryTopUpTransactions] = useState<string>('');
    const [identitiesWithoutEmail, setIdentitiesWithoutEmail] = useState<number>(0);
    const [lastQueryImplementations, setLastQueryImplementations] = useState<string>('');
    const [identities, setIdentities] = useState<PaginationData<Identity>>(null);
    const [shownImplementationMenuId, setShownImplementationMenuId] = useState<number>(null);
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);
    const [topUpTransactions, setTopUpTransactions] = useState<PaginationData<FundTopUpTransaction>>(null);
    const [validatorOrganizations, setValidatorOrganizations] = useState<PaginationData<Organization>>(null);

    const [topUpPaginationPerPageKey] = useState('fund_top_up_per_page');
    const [implementationPaginationPerPageKey] = useState('fund_implementation_per_page');
    const [identitiesPaginationPerPageKey] = useState('fund_identities_per_page');

    const topUpTransactionFilters = useFilter({
        q: '',
        amount_min: null,
        amount_max: null,
        from: null,
        to: null,
        per_page: paginatorService.getPerPage(topUpPaginationPerPageKey),
    });

    const implementationsFilters = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(implementationPaginationPerPageKey),
    });

    const identitiesFilters = useFilter({
        per_page: paginatorService.getPerPage(identitiesPaginationPerPageKey),
    });

    const canInviteProviders = useMemo(() => {
        return hasPermission(activeOrganization, 'manage_funds') && fund?.state != 'closed';
    }, [activeOrganization, fund?.state]);

    const providersDescription = useMemo(() => {
        return [
            `${fund?.provider_organizations_count}`,
            `(${fund?.provider_employees_count} ${translate('fund_card_sponsor.labels.employees')})`,
        ].join(' ');
    }, [fund?.provider_employees_count, fund?.provider_organizations_count, translate]);

    const canAccessFund = useMemo(() => {
        return fund?.state != 'closed';
    }, [fund]);

    const transformImplementations = useCallback(() => {
        const { q = '', per_page } = implementationsFilters.activeValues;
        const links = { active: false, label: '', url: '' };

        setLastQueryImplementations(q);

        if (
            fund?.implementation &&
            (!q || fund?.implementation?.name?.toLowerCase().includes(q?.toLowerCase().trim()))
        ) {
            setImplementations({
                data: [fund.implementation],
                meta: { total: 1, current_page: 1, per_page, from: 1, to: 1, last_page: 1, path: '', links },
            });
        } else {
            setImplementations({
                data: [],
                meta: { total: 0, current_page: 1, per_page, from: 0, to: 0, last_page: 1, path: '', links },
            });
        }
    }, [implementationsFilters.activeValues, fund?.implementation]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, parseInt(fundId), { stats: 'budget' })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId]);

    const fetchTopUps = useCallback(() => {
        if (!fund?.is_configured) {
            setLastQueryTopUpTransactions(topUpTransactionFilters.activeValues.q);
            return;
        }

        setProgress(0);

        fundService
            .listTopUpTransactions(activeOrganization.id, parseInt(fundId), topUpTransactionFilters.activeValues)
            .then((res) => {
                setTopUpTransactions(res.data);
                setLastQueryTopUpTransactions(topUpTransactionFilters.activeValues.q);
            })
            .finally(() => setProgress(100));
    }, [
        fund?.is_configured,
        setProgress,
        fundService,
        activeOrganization.id,
        fundId,
        topUpTransactionFilters.activeValues,
    ]);

    const fetchIdentities = useCallback(() => {
        setProgress(0);

        fundService
            .listIdentities(activeOrganization.id, parseInt(fundId), identitiesFilters.activeValues)
            .then((res) => {
                setIdentities(res.data);
                setIdentitiesActive(res.data.meta.counts['active']);
                setIdentitiesWithoutEmail(res.data.meta.counts['without_email']);
                setLastQueryIdentities(identitiesFilters.activeValues.q);
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, identitiesFilters.activeValues]);

    const fetchValidatorOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .readListValidators(activeOrganization.id, { per_page: 100 })
            .then((res) => setValidatorOrganizations(res.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, organizationService, setProgress]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const exportIdentities = useCallback(() => {
        fundIdentitiesExportService.exportData(activeOrganization.id, fund.id, identitiesFilters.activeValues);
    }, [activeOrganization.id, fund?.id, fundIdentitiesExportService, identitiesFilters.activeValues]);

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterionLocal>) => {
            setProgress(0);

            fundService
                .updateCriteria(fund.organization_id, fund.id, criteria)
                .then((res) => {
                    fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger(err.data.message || 'Error!'))
                .finally(() => setProgress(100));
        },
        [fund, fundService, pushDanger, pushSuccess, setProgress],
    );

    const inviteProvider = useCallback(
        (fund: Fund) => {
            if (!canInviteProviders) {
                return;
            }

            openModal((modal) => (
                <ModalFundInviteProviders
                    fund={fund}
                    modal={modal}
                    onSubmit={(res) => {
                        pushSuccess(
                            'Aanbieders uitgenodigd!',
                            `${res.length} uitnodigingen verstuurt naar aanbieders!`,
                        );

                        setTimeout(() => document.location.reload(), 2000);
                    }}
                />
            ));
        },
        [openModal, pushSuccess, canInviteProviders],
    );

    const deleteFund = useCallback(
        (fund: Fund) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={translate('fund_card_sponsor.confirm_delete.title')}
                    description={translate('fund_card_sponsor.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            fundService
                                .destroy(activeOrganization.id, fund.id)
                                .then(() =>
                                    navigateState('organization-funds', { organizationId: activeOrganization.id }),
                                );
                        },
                    }}
                />
            ));
        },
        [activeOrganization.id, fundService, navigateState, openModal, translate],
    );

    useEffect(() => {
        if (viewType == 'top_ups') {
            fetchTopUps();
        }
    }, [viewType, fetchTopUps]);

    useEffect(() => {
        if (viewType == 'implementations') {
            transformImplementations();
        }
    }, [viewType, transformImplementations]);

    useEffect(() => {
        if (viewType == 'identities') {
            fetchIdentities();
        }
    }, [viewType, fetchIdentities]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchValidatorOrganizations();
    }, [fetchValidatorOrganizations]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="organization-funds"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    {translate('page_state_titles.funds')}
                </StateNavLink>

                <div className="breadcrumb-item active">{fund.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <div className="block block-fund">
                        <div className="fund-overview">
                            <div className="fund-media">
                                <img
                                    className="fund-media-img"
                                    src={fund.logo?.sizes.thumbnail || './assets/img/placeholders/fund-thumbnail.png'}
                                    alt={''}
                                />
                            </div>

                            <div className="fund-details">
                                <div className="fund-header">
                                    <div className="fund-name">{fund.name}</div>
                                    {fund.state == 'active' && (
                                        <div className="tag tag-success tag-sm">
                                            {translate('components.organization_funds.states.active')}
                                        </div>
                                    )}

                                    {fund.state == 'paused' && (
                                        <div className="tag tag-warning tag-sm">
                                            {translate('components.organization_funds.states.paused')}
                                        </div>
                                    )}

                                    {fund.state == 'closed' && (
                                        <div className="tag tag-default tag-sm">
                                            {translate('components.organization_funds.states.closed')}
                                        </div>
                                    )}
                                </div>

                                <div className="fund-description">{fund.description_short}</div>
                            </div>
                        </div>

                        <div className="fund-actions">
                            <div className="button-group flex-end">
                                {hasPermission(activeOrganization, 'manage_funds') &&
                                    activeOrganization.allow_2fa_restrictions && (
                                        <StateNavLink
                                            className="button button-default"
                                            name="funds-security"
                                            params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                            <em className="mdi mdi-security icon-start" />
                                            {translate('fund_card_sponsor.buttons.security')}
                                        </StateNavLink>
                                    )}

                                {hasPermission(fund.organization, 'manage_funds') && fund.state == 'waiting' && (
                                    <button className="button button-default" onClick={() => deleteFund(fund)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        Verwijderen
                                    </button>
                                )}

                                {hasPermission(fund.organization, ['manage_funds', 'manage_fund_texts']) && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-edit"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        Bewerken
                                    </StateNavLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col">
                            <div className="card-title">
                                {translate(`funds_show.labels.base_card.header.${viewGeneralType}`)}
                            </div>
                        </div>

                        <div className="flex">
                            <div className="block block-inline-filters">
                                <div className="flex">
                                    <div>
                                        <div className="block block-label-tabs pull-right">
                                            <div className="label-tab-set">
                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'description' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('description')}>
                                                    Beschrijving
                                                </div>

                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'formulas' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('formulas')}>
                                                    Rekenregels
                                                </div>

                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'statistics' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('statistics')}>
                                                    Statistieken
                                                </div>

                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'criteria' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('criteria')}>
                                                    Voorwaarden
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewGeneralType == 'description' && (
                    <div className="card-section">
                        <div className="fund-description">
                            {fund.description_html && (
                                <div className="description-body">
                                    <div className="arrow-box border bg-dim">
                                        <div className="arrow" />
                                    </div>

                                    <div className="block block-markdown">
                                        <TranslateHtml i18n={fund.description_html} />
                                    </div>
                                </div>
                            )}

                            {!fund.description_html && (
                                <div className="description-body">
                                    <div className="arrow-box border bg-dim">
                                        <div className="arrow" />
                                    </div>
                                    Geen data
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewGeneralType == 'formulas' && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                {fund.formulas?.length > 0 ? (
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Type</th>
                                                <th>Bedrag</th>
                                                <th>Gegeven</th>
                                                <th className="text-right">Laatste aanpassing</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {fund.formulas.map((formula) => (
                                                <tr key={formula.id}>
                                                    <td>{formula.id}</td>
                                                    <td>{formula.type}</td>
                                                    <td>{formula.amount_locale}</td>
                                                    <td>{formula.record_type_name || '-'}</td>
                                                    <td className="text-right">
                                                        <strong className="text-primary">
                                                            {formula.updated_at_locale.split(' - ')[0]}
                                                        </strong>
                                                        <br />
                                                        {formula.updated_at_locale.split(' - ')[1]}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <EmptyCard title={'No fund formulas'} />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {viewGeneralType == 'criteria' && (
                    <div className="card-section card-section-primary">
                        <div className="form">
                            <FundCriteriaEditor
                                fund={fund}
                                organization={fund.organization}
                                criteria={fund.criteria}
                                isEditable={fund.criteria_editable}
                                recordTypes={recordTypes}
                                setCriteria={(criteria) => setFund({ ...fund, criteria })}
                                saveButton={true}
                                onSaveCriteria={(criteria) => {
                                    saveCriteria(criteria);
                                }}
                                validatorOrganizations={validatorOrganizations.data}
                            />
                        </div>
                    </div>
                )}

                {viewGeneralType == 'statistics' && fund.is_configured && (
                    <div className="card-section card-section-warning">
                        <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                            <a className="keyvalue-item col col-lg-3">
                                <div className="keyvalue-key">
                                    {translate('fund_card_sponsor.labels.your_employees')}
                                </div>
                                <div
                                    className="keyvalue-value"
                                    onClick={() => {
                                        navigateState('employees', { organizationId: fund.organization_id });
                                    }}>
                                    <span>{fund.sponsor_count}</span>
                                    <span className="icon mdi mdi-account-multiple-plus" />
                                </div>
                            </a>

                            <div
                                className={`keyvalue-item col col-lg-3 ${
                                    !canInviteProviders ? 'keyvalue-item-disabled' : ''
                                }`}
                                onClick={() => inviteProvider(fund)}>
                                <div className="keyvalue-key">{translate('fund_card_sponsor.labels.providers')}</div>
                                <div className="keyvalue-value">
                                    <span>{providersDescription}</span>
                                    <em className="icon mdi mdi-account-multiple-plus" />
                                </div>
                            </div>

                            <a
                                className={`keyvalue-item col col-lg-3 ${
                                    !canAccessFund ? 'keyvalue-item-disabled' : ''
                                }`}
                                onClick={() => {
                                    navigateState('csv-validation', { fundId: fund.organization_id });
                                }}>
                                <div className="keyvalue-key">{translate('fund_card_sponsor.labels.applicants')}</div>
                                <div className="keyvalue-value">
                                    <span>{fund.requester_count}</span>
                                    {canAccessFund && <span className="icon mdi mdi-account-multiple-plus" />}
                                </div>
                            </a>
                        </div>
                    </div>
                )}

                {viewGeneralType == 'statistics' && (
                    <Fragment>
                        {fund.budget ? (
                            <div className="card-section card-section-primary">
                                <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Gestort</div>
                                        <div className="keyvalue-value">
                                            {currencyFormat(parseInt(fund.budget.total.toString()))}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Gebruikt</div>
                                        <div className="keyvalue-value">
                                            {currencyFormat(parseInt(fund.budget.used.toString()))}
                                        </div>
                                    </div>

                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Resterend</div>
                                        <div className="keyvalue-value">
                                            {currencyFormat(
                                                parseInt(fund.budget.total.toString()) -
                                                    parseInt(fund.budget.used.toString()),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyCard title={'Geen statistieken'} type={'card-section'} />
                        )}
                    </Fragment>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-grow">
                            <div className="flex-col">
                                <div className="card-title">
                                    {translate(`funds_show.titles.${viewType}`)}

                                    {viewType == 'top_ups' && (
                                        <span>&nbsp;({topUpTransactions?.meta?.total || 0})</span>
                                    )}
                                    {viewType == 'implementations' && (
                                        <span>&nbsp;({implementations?.meta?.total || 0})</span>
                                    )}
                                    {viewType == 'identities' && <span>&nbsp;({identities?.meta?.total || 0})</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex-row">
                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <div className="flex">
                                        <div>
                                            <div className="block block-label-tabs pull-right">
                                                <div className="label-tab-set">
                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'top_ups' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('top_ups')}>
                                                        Bekijk aanvullingen
                                                    </div>

                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'implementations' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('implementations')}>
                                                        Webshop
                                                    </div>

                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'identities' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('identities')}>
                                                        Aanvragers
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {viewType == 'top_ups' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {topUpTransactionFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => topUpTransactionFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start" />
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!topUpTransactionFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={topUpTransactionFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    topUpTransactionFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => topUpTransactionFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {topUpTransactionFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={translate(
                                                                            'funds_show.top_up_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            defaultValue={
                                                                                topUpTransactionFilters.values.q
                                                                            }
                                                                            onChange={(e) =>
                                                                                topUpTransactionFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={translate(
                                                                                'funds_show.top_up_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={translate(
                                                                            'funds_show.top_up_table.filters.amount',
                                                                        )}>
                                                                        <div className="row">
                                                                            <div className="col col-lg-6">
                                                                                <input
                                                                                    className="form-control"
                                                                                    min={0}
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        topUpTransactionFilters.values
                                                                                            .amount_min || ''
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        topUpTransactionFilters.update({
                                                                                            amount_min: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    placeholder={translate(
                                                                                        'funds_show.top_up_table.filters.amount_min',
                                                                                    )}
                                                                                />
                                                                            </div>

                                                                            <div className="col col-lg-6">
                                                                                <input
                                                                                    className="form-control"
                                                                                    min={0}
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        topUpTransactionFilters.values
                                                                                            .amount_max || ''
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        topUpTransactionFilters.update({
                                                                                            amount_max: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    placeholder={translate(
                                                                                        'transactions.labels.amount_max',
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={translate(
                                                                            'funds_show.top_up_table.filters.from',
                                                                        )}>
                                                                        <DatePickerControl
                                                                            value={dateParse(
                                                                                topUpTransactionFilters.values.from,
                                                                            )}
                                                                            placeholder={translate('dd-MM-yyyy')}
                                                                            onChange={(from: Date) => {
                                                                                topUpTransactionFilters.update({
                                                                                    from: dateFormat(from),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={translate(
                                                                            'funds_show.top_up_table.filters.to',
                                                                        )}>
                                                                        <DatePickerControl
                                                                            value={dateParse(
                                                                                topUpTransactionFilters.values.to,
                                                                            )}
                                                                            placeholder={translate('dd-MM-yyyy')}
                                                                            onChange={(to: Date) => {
                                                                                topUpTransactionFilters.update({
                                                                                    to: dateFormat(to),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </FilterItemToggle>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                topUpTransactionFilters.setShow(
                                                                    !topUpTransactionFilters.show,
                                                                )
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}

                                    {viewType == 'implementations' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {implementationsFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => implementationsFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!implementationsFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={implementationsFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    implementationsFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => implementationsFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {implementationsFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={translate(
                                                                            'funds_show.implementations_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            value={implementationsFilters.values.q}
                                                                            onChange={(e) =>
                                                                                implementationsFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={translate(
                                                                                'funds_show.implementations_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                implementationsFilters.setShow(
                                                                    !implementationsFilters.show,
                                                                )
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}

                                    {viewType == 'identities' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {identitiesFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => identitiesFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!identitiesFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={identitiesFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    identitiesFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => identitiesFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {identitiesFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={translate(
                                                                            'funds_show.top_up_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            value={identitiesFilters.values.q}
                                                                            onChange={(e) =>
                                                                                identitiesFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={translate(
                                                                                'funds_show.top_up_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <div className="form-actions">
                                                                        <button
                                                                            className="button button-primary button-wide"
                                                                            onClick={() => exportIdentities()}>
                                                                            <em className="mdi mdi-download icon-start" />
                                                                            <span>
                                                                                {translate(
                                                                                    'components.dropdown.export',
                                                                                    {
                                                                                        total: identities.meta.total,
                                                                                    },
                                                                                )}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                identitiesFilters.setShow(!identitiesFilters.show)
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewType == 'top_ups' && (
                    <Fragment>
                        {topUpTransactions?.meta?.total > 0 ? (
                            <div className="card-section card-section-padless">
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <ThSortable
                                                    filter={topUpTransactionFilters}
                                                    label={translate('funds_show.top_up_table.columns.code')}
                                                    value="code"
                                                />
                                                <ThSortable
                                                    filter={topUpTransactionFilters}
                                                    label={translate('funds_show.top_up_table.columns.iban')}
                                                    value="iban"
                                                />
                                                <ThSortable
                                                    filter={topUpTransactionFilters}
                                                    label={translate('funds_show.top_up_table.columns.amount')}
                                                    value="amount"
                                                />
                                                <ThSortable
                                                    className="text-right"
                                                    filter={topUpTransactionFilters}
                                                    label={translate('funds_show.top_up_table.columns.date')}
                                                    value="created_at"
                                                />
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {topUpTransactions.data.map((top_up_transaction: FundTopUpTransaction) => (
                                                <tr key={top_up_transaction.id}>
                                                    <td>{top_up_transaction.code}</td>
                                                    <td className={!top_up_transaction.iban ? 'text-muted' : ''}>
                                                        {top_up_transaction.iban || 'Geen IBAN'}
                                                    </td>
                                                    <td>{top_up_transaction.amount_locale}</td>
                                                    <td className="text-right">
                                                        {top_up_transaction.created_at_locale}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EmptyCard
                                title="No top-ups"
                                type={'card-section'}
                                description={
                                    lastQueryTopUpTransactions
                                        ? `Could not find any top-ups for "${lastQueryTopUpTransactions}"`
                                        : null
                                }
                            />
                        )}

                        {topUpTransactions && (
                            <div
                                className={'card-section card-section-narrow'}
                                hidden={topUpTransactions?.meta?.total < 2}>
                                <Paginator
                                    meta={topUpTransactions.meta}
                                    filters={topUpTransactionFilters.activeValues}
                                    updateFilters={topUpTransactionFilters.update}
                                />
                            </div>
                        )}
                    </Fragment>
                )}

                {viewType == 'implementations' && (
                    <Fragment>
                        {implementations?.meta?.total > 0 ? (
                            <div className="card-section card-section-padless">
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="td-narrow">Afbeelding</th>
                                                <th>Naam</th>
                                                <th>Status</th>
                                                <th>Acties</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {implementations?.data?.map((implementation) => (
                                                <tr key={implementation?.id}>
                                                    <td className="td-narrow">
                                                        <img
                                                            className="td-media"
                                                            src={assetUrl(
                                                                '/assets/img/placeholders/organization-thumbnail.png',
                                                            )}
                                                            alt={''}></img>
                                                    </td>
                                                    <td>{implementation?.name}</td>
                                                    {fund.state == 'active' && (
                                                        <td>
                                                            <div className="label label-success">Zichtbaar</div>
                                                        </td>
                                                    )}
                                                    {fund.state != 'active' && (
                                                        <td>
                                                            <div className="label label-success">Onzichtbaar</div>
                                                        </td>
                                                    )}

                                                    <td className="td-narrow text-right">
                                                        <TableRowActions
                                                            activeId={shownImplementationMenuId}
                                                            setActiveId={setShownImplementationMenuId}
                                                            id={implementation.id}>
                                                            <div className="dropdown dropdown-actions">
                                                                <a
                                                                    className="dropdown-item"
                                                                    target="_blank"
                                                                    href={
                                                                        implementation?.url_webshop + 'funds/' + fund.id
                                                                    }
                                                                    rel="noreferrer">
                                                                    <em className="mdi mdi-open-in-new icon-start" />{' '}
                                                                    Bekijk op webshop
                                                                </a>

                                                                {hasPermission(
                                                                    activeOrganization,
                                                                    'manage_implementation_cms',
                                                                ) && (
                                                                    <StateNavLink
                                                                        name={'implementation-view'}
                                                                        params={{
                                                                            organizationId: fund.organization_id,
                                                                            id: implementation?.id,
                                                                        }}
                                                                        className="dropdown-item">
                                                                        <em className="mdi mdi-store-outline icon-start" />
                                                                        Ga naar CMS
                                                                    </StateNavLink>
                                                                )}
                                                            </div>
                                                        </TableRowActions>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EmptyCard
                                title="No webshops"
                                type={'card-section'}
                                description={
                                    lastQueryImplementations
                                        ? `Could not find any webshops for "${lastQueryImplementations}"`
                                        : null
                                }
                            />
                        )}

                        {implementations && (
                            <div
                                className="card-section card-section-narrow"
                                hidden={implementations?.meta?.last_page < 2}>
                                <Paginator
                                    meta={implementations.meta}
                                    filters={implementationsFilters.activeValues}
                                    updateFilters={implementationsFilters.update}
                                />
                            </div>
                        )}
                    </Fragment>
                )}

                {viewType == 'identities' && (
                    <Fragment>
                        {identities?.meta?.total > 0 ? (
                            <div className="card-section card-section-padless">
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <ThSortable filter={identitiesFilters} label={'ID'} value="id" />
                                                <ThSortable filter={identitiesFilters} label={'E-mail'} value="email" />
                                                <ThSortable
                                                    filter={identitiesFilters}
                                                    label={'Totaal aantal vouchers'}
                                                    value="count_vouchers"
                                                />
                                                <ThSortable
                                                    filter={identitiesFilters}
                                                    label={'Actieve vouchers'}
                                                    value="count_vouchers_active"
                                                />
                                                <ThSortable
                                                    filter={identitiesFilters}
                                                    label={'Actieve vouchers met saldo'}
                                                    value="count_vouchers_active_with_balance"
                                                />
                                                <th className="nowrap text-right">
                                                    {translate('identities.labels.actions')}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {identities.data.map((identity: Identity, index: number) => (
                                                <tr key={index}>
                                                    <td>{identity.id}</td>
                                                    <td>{identity.email}</td>
                                                    <td>{identity.count_vouchers}</td>
                                                    <td>{identity.count_vouchers_active}</td>
                                                    <td>{identity.count_vouchers_active_with_balance}</td>
                                                    <td>
                                                        <StateNavLink
                                                            className="button button-primary button-sm pull-right"
                                                            name={'identities-show'}
                                                            params={{
                                                                organizationId: fund.organization_id,
                                                                id: identity.id,
                                                                fundId: fund.id,
                                                            }}>
                                                            <em className="icon-start mdi mdi-eye-outline" />
                                                            Bekijken
                                                        </StateNavLink>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EmptyCard
                                title={'Geen gebruikers gevonden'}
                                type={'card-section'}
                                description={
                                    lastQueryIdentities
                                        ? `Geen gebruikers gevonden voor "${lastQueryIdentities}"`
                                        : null
                                }
                            />
                        )}

                        {identities?.meta && (
                            <div className="card-section card-section-narrow" hidden={identities.meta.total < 2}>
                                <Paginator
                                    meta={identities.meta}
                                    filters={identitiesFilters.activeValues}
                                    updateFilters={identitiesFilters.update}
                                />
                            </div>
                        )}

                        {identities?.meta?.total > 0 && (
                            <div className="card-section card-section-primary">
                                <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                                    <div className="keyvalue-item col col-lg-4">
                                        <div className="keyvalue-key">Aanvragers met vouchers</div>
                                        <div className="keyvalue-value">
                                            <span>{identitiesActive}</span>
                                            <span className="icon mdi mdi-account-multiple-outline" />
                                        </div>
                                    </div>

                                    <div className="keyvalue-item col col-lg-4">
                                        <div className="keyvalue-key">Aanvragers zonder e-mailadres</div>
                                        <div className="keyvalue-value">
                                            <span>{identitiesWithoutEmail}</span>
                                            <span className="icon mdi mdi-email-off-outline" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}
