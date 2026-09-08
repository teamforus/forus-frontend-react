import React from 'react';

export default function ClarificationContactInfo({
    contactInformation,
    onClose,
}: {
    contactInformation?: string;
    onClose: () => void;
}) {
    return (
        <div className="modal-window">
            <a className="mdi mdi-close modal-close" onClick={onClose} role="button" />
            <div className="modal-icon">
                <div className="mdi mdi-message-text-outline" />
            </div>
            <div className="modal-body form">
                <div className="modal-section modal-section-pad">
                    {contactInformation ? (
                        <div className="text-center">
                            <div className="modal-heading">
                                De aanvrager heeft geen e-mailadres, maar heeft wel contactgegevens opgegeven.
                            </div>
                            <div className="modal-text">
                                <strong>Contactgegevens: </strong>
                                <br />
                                <span>{contactInformation}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="modal-heading">
                                De aanvrager heeft geen e-mailadres en heeft geen contactgegevens opgegeven.
                            </div>
                            <div className="modal-text">
                                Helaas heeft de aanvrager geen contactgegevens opgegeven, als er aanvullende informatie
                                nodig is om de aanvraag te beoordelen dient het contact buiten het systeem te verlopen.
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="modal-footer text-center">
                <button className="button button-default" onClick={onClose}>
                    Annuleer
                </button>
            </div>
        </div>
    );
}
