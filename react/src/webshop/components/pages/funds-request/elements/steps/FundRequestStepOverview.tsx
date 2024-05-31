import React, { Fragment } from 'react';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import { LocalCriterion } from '../../FundRequest';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';

export default function FundRequestStepOverview({
    pendingCriteria,
    onSubmitRequest,
    contactInformation,
    emailSetupShow,
    onPrevStep,
    progress,
    bsnWarning,
}: {
    pendingCriteria: Array<LocalCriterion>;
    onSubmitRequest: () => void;
    contactInformation: string;
    emailSetupShow: boolean;
    onPrevStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <h2 className="sign_up-pane-header">Aanvraag overzicht</h2>
                <div className="sign_up-pane-body">
                    <p className="sign_up-pane-text">
                        <span>
                            Controleer hieronder of de gegevens die u heeft ingevuld juist zijn. U kunt terug naar
                            eerdere stappen met de knop{' '}
                        </span>
                        <strong>Vorige stap.</strong>
                    </p>
                    <p className="sign_up-pane-text">
                        <span>Kloppen de gegevens? Klik dan op de knop </span>
                        <strong>Vraag aan.</strong>
                    </p>
                </div>
                <div className="sign_up-pane-body">
                    <ul className="sign_up-pane-list sign_up-pane-list-criteria">
                        {pendingCriteria?.map((criteria) => (
                            <li key={criteria.id}>
                                <div className="item-icon item-icon-default" />
                                <span>
                                    {criteria.title || criteria.record_type?.name}{' '}
                                    {criteria.operator != '=' && <span>is </span>}
                                </span>
                                <strong>
                                    {!['select', 'select_number', 'bool'].includes(criteria.record_type.type) && (
                                        <span>{criteria.input_value || 'Geen'}</span>
                                    )}

                                    {['select', 'select_number'].includes(criteria.record_type.type) && (
                                        <span>
                                            {criteria?.record_type_options?.[criteria?.input_value]?.name ||
                                                'Niet geselecteerd'}{' '}
                                        </span>
                                    )}

                                    {['bool'].includes(criteria.record_type.type) && (
                                        <span>{criteria.is_checked ? 'Ja' : 'Nee'}</span>
                                    )}
                                </strong>
                                {criteria.show_attachment && (
                                    <FileUploader
                                        type="fund_request_record_proof"
                                        files={criteria.files}
                                        readOnly={true}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {(contactInformation || emailSetupShow) && (
                    <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                        <p className=" sign_up-pane-text" />
                        <div className=" text-strong">Opgegeven contactgegevens:</div>
                        <span>{contactInformation || 'Geen'}</span>
                        <p />
                    </div>
                )}

                <div className="sign_up-pane-footer">
                    <div className="row">
                        <div className="col col-lg-6 col-xs-6 text-left">
                            <button
                                className="button button-text button-text-padless"
                                onClick={onPrevStep}
                                role="button">
                                <div className="mdi mdi-chevron-left icon-left" />
                                {translate('fund_request.sign_up.pane.footer.prev')}
                            </button>
                        </div>
                        <div className="col col-lg-6 col-xs-6 text-right">
                            <button className="button button-primary" onClick={onSubmitRequest} role="button">
                                Vraag aan
                            </button>
                        </div>
                    </div>
                </div>

                {bsnWarning}
            </div>
        </Fragment>
    );
}
