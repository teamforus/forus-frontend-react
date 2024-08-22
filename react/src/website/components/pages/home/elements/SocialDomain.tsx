import React, { Fragment, useState } from 'react';

export default function SocialDomain() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="block block-social-domain">
            <div className="block-social-domain-banner">
                <div className="block-social-domain-banner-main">
                    <div className="block-social-domain-banner-info">
                        <div className="block-social-domain-banner-subtitle">Samenwerken binnen het</div>
                        <div className="block-social-domain-banner-title">Sociaal Domein</div>
                    </div>

                    <div className="block-social-domain-banner-actions">
                        <div className="button button-light">Laten we kennismaken</div>
                    </div>
                </div>
            </div>

            <div className="block-social-domain-info">
                {showMore ? (
                    <Fragment>
                        Forus richt zich op het ondersteunen van organisaties die zich inzetten binnen het sociaal
                        domein. Ons streven is om organisaties effectiever en efficiënter te laten werken. Dit vergt een
                        samenspel van beleid, organisatie en techniek. Forus ondersteunt en faciliteert.
                        <br />
                        <br />
                        Het huidige ondersteuningssysteem schiet tekort: ondanks dat er al veel armoedebestrijding is
                        ervaren veel mensen met financiële problemen stress en stigmatisering wanneer het overzicht
                        ontbreekt en gefragmenteerd wordt aangeboden.
                        <br />
                        <br />
                        There are many variations of passages of Lorem Ipsum available, but the majority have suffered
                        alteration in some form, by injected humour, or randomised words which don&apos;t look even
                        slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there
                        isn&apos;t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on
                        the Internet tend to repeat predefined chunks as necessary, making this the first true generator
                        on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model
                        sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum
                        is therefore always free from repetition, injected humour, or non-characteristic words etc.
                    </Fragment>
                ) : (
                    <Fragment>
                        Forus richt zich op het ondersteunen van organisaties die zich inzetten binnen het sociaal
                        domein. Ons streven is om organisaties effectiever en efficiënter te laten werken. Dit vergt een
                        samenspel van beleid, organisatie en techniek. Forus ondersteunt en faciliteert.
                        <br />
                        <br />
                        Het huidige ondersteuningssysteem schiet tekort: ondanks dat er al veel armoedebestrijding is
                        ervaren veel mensen met financiële problemen stress en stigmatisering wanneer het overzicht
                        ontbreekt en gefragmenteerd wordt aangeboden. ...
                    </Fragment>
                )}
                <div className="block-social-domain-info-actions">
                    {showMore ? (
                        <div
                            className="button button-light"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(false);
                            }}>
                            Lees meer
                            <em className={'mdi mdi-chevron-down icon-right'} />
                        </div>
                    ) : (
                        <div
                            className="button button-light"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(true);
                            }}>
                            Lees minder
                            <em className={'mdi mdi-chevron-up icon-right'} onClick={() => setShowMore(true)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
