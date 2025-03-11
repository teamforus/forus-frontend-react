import React, { Fragment } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';

export default function MolliePrivacy() {
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'payment-methods'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Algemene voorwaarden
                </StateNavLink>
                <div className="breadcrumb-item active">Algemene Voorwaarden</div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Algemene voorwaarden</div>
                </div>

                <div className="card-section">
                    <div className="block block-content">
                        <p>
                            Bij het gebruik van de koppeling tussen het Forus-platform en Mollie&apos;s betaaldiensten,
                            zijn de algemene voorwaarden van zowel Forus als Mollie van toepassing. Deze samenwerking is
                            ontworpen om een naadloze integratie van betalingsprocessen binnen het Forus-platform te
                            faciliteren. Daarnaast zijn, afhankelijk van de specifieke omstandigheden en aard van de
                            transacties, de voorwaarden van de fondseigenaar ook van kracht. Gebruikers worden
                            aangemoedigd om zich vertrouwd te maken met deze voorwaarden om een volledig begrip en
                            naleving van alle relevante richtlijnen en vereisten te waarborgen.
                        </p>
                        <p>
                            U bent verplicht zich te registreren alvorens u gebruik kunt maken van onze dienstverlening.
                            Registratie vindt plaats door het aanmaken van een Account. Om te voldoen aan
                            anti-terrorisme, financiële dienstverlening en overige toepasselijke wet- en regelgeving en
                            KYC (“Know Your Customer”) vereisten, zoals vereist door Forus en Mollie, haar gelieerde
                            onderneming en/of opgelegd door Financiële Instellingen of intermediairs, Zijn wij verplicht
                            bepaalde informatie over u op te vragen. Tijdens het registratieproces zullen wij daarom
                            informatie opvragen over onder meer de naam van uw Bedrijf, de handelsnaam (indien van
                            toepassing), adresgegevens, mailadres en telefoonnummer, nummer van inschrijving bij de
                            Kamer van Koophandel en BTW-nummer en alle andere informatie waar wij van tijd tot tijd
                            redelijkerwijs om kunnen verzoeken en die u op ons eerste verzoek dient te verstrekken. U
                            ons ook informatie te verstrekken over de uiteindelijk belanghebbende(n) van het Bedrijf.
                            Tevens dient de persoon die u bij ons registreert daartoe bevoegd en gemachtigd te zijn. U
                            bevestigt uw nationaliteit tijdens de registratie en dat u bevoegd bent zakelijke
                            activiteiten te ontplooien in het geregistreerde land.
                        </p>
                        <p>
                            U verklaart, garandeert en verbindt zich ertoe dat alle informatie die u verstrekt juist,
                            compleet en waarheidsgetrouw is en dat u de geregistreerde informatie bij elke wijziging
                            onmiddellijk bijwerkt, zodat deze te allen tijde volledig, juist en actueel is. U bent
                            verplicht ons onverwijld op de hoogte te stellen van wijzigingen in bedrijfsnaam,
                            bedrijfsstatus, bedrijfsstructuur, soort en omvang van de dienstverlening of enige andere
                            relevante wijzigingen. Wij kunnen uw Account met onmiddellijke ingang opschorten of deze
                            Overeenkomst beëindigen zonder waarschuwing indien u deze informatie niet actueel houdt
                            en/of indien u ons de gevraagde informatie niet op eerste verzoek verstrekt.
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
