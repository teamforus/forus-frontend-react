import React from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import Fund from '../../props/models/Fund';
import Markdown from '../elements/markdown/Markdown';
import ChatIcon from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-help/icon-chat.svg';
import PhoneIcon from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-help/icon-phone.svg';
import EmailIcon from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-help/icon-email.svg';
import WebsiteIcon from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-help/icon-website.svg';
import { strLimit } from '../../../dashboard/helpers/string';

export default function ModalFundHelp({ modal, fund }: { modal: ModalState; fund: Fund }) {
    return (
        <div className={`modal modal-fund-help modal-animated ${modal.loading ? '' : 'modal-loaded'}`}>
            <div className="modal-backdrop" onClick={modal.close} aria-label="Sluiten" />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label="Sluiten"
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{fund.help_block_text}</h2>
                </div>

                <div className="modal-body">
                    <div className="modal-section flex flex-vertical flex-gap-xl">
                        <div className="flex flex-vertical flex-gap">
                            <div className="modal-section-title">{fund.help_title}</div>
                            <div className="modal-section-description">
                                <Markdown content={fund.help_description_html} />
                            </div>
                        </div>

                        {(fund.help_show_chat ||
                            fund.help_show_phone ||
                            fund.help_show_email ||
                            fund.help_show_website) && (
                            <div className="modal-fund-help-pane">
                                {fund.help_show_chat && (
                                    <div className="modal-fund-help-pane-item">
                                        <div className="modal-fund-help-pane-icon">
                                            <ChatIcon />
                                        </div>
                                        <div className="modal-fund-help-pane-content">
                                            <div className="modal-fund-help-pane-title">Chat</div>
                                            <div className="modal-fund-help-pane-subtitle">
                                                <a
                                                    className="link"
                                                    href={fund.help_chat}
                                                    target="_blank"
                                                    rel="noreferrer">
                                                    Ga naar de beheeromgeving
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fund.help_show_phone && (
                                    <div className="modal-fund-help-pane-item">
                                        <div className="modal-fund-help-pane-icon">
                                            <PhoneIcon />
                                        </div>
                                        <div className="modal-fund-help-pane-content">
                                            <div className="modal-fund-help-pane-title">Telefoon</div>
                                            <div className="modal-fund-help-pane-subtitle">
                                                <a
                                                    href={`tel:+${fund.help_phone.replace(/\D/g, '')}`}
                                                    title={fund.help_phone}>
                                                    {strLimit(fund.help_phone, 20)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fund.help_show_email && (
                                    <div className="modal-fund-help-pane-item">
                                        <div className="modal-fund-help-pane-icon">
                                            <EmailIcon />
                                        </div>
                                        <div className="modal-fund-help-pane-content">
                                            <div className="modal-fund-help-pane-title">E-mail</div>
                                            <div className="modal-fund-help-pane-subtitle">
                                                <a href={`mailto:${fund.help_email}`} title={fund.help_email}>
                                                    {strLimit(fund.help_email, 25)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fund.help_show_website && (
                                    <div className="modal-fund-help-pane-item">
                                        <div className="modal-fund-help-pane-icon">
                                            <WebsiteIcon />
                                        </div>
                                        <div className="modal-fund-help-pane-content">
                                            <div className="modal-fund-help-pane-title">Website</div>
                                            <div className="modal-fund-help-pane-subtitle">
                                                <a
                                                    href={fund.help_website}
                                                    title={fund.help_website}
                                                    target="_blank"
                                                    rel="noreferrer">
                                                    {strLimit(fund.help_website.replace('https://', ''), 30)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="button button-sm button-light" onClick={modal.close}>
                        Sluiten
                    </button>
                </div>
            </div>
        </div>
    );
}
