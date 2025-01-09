export default {
    breadcrumbs: {
        home: 'Home',
        accessibility: 'Toegankelijkheidsverklaring',
    },
    title: 'Toegankelijkheidsverklaring',
    vars: {
        westerkwartier: {
            implementation_name: 'Kindpakket',
            organization_name: 'Westerkwartier',
            website: 'https://westerkwartier.forus.io/',
            contact_email: 'webmaster@westerkwartier.nl',
            accessibility_link: 'www.westerkwartier.nl/toegankelijkheid',
            telephone_number: '14 0594',
        },
        noordoostpolder: {
            implementation_name: 'Meedoenpakket',
            organization_name: 'Noordoostpolder',
            website: 'https://noordoostpolder.forus.io/',
            contact_email: 'info@noordoostpolder.nl',
            accessibility_link: 'https://www.noordoostpolder.nl/toegankelijkheid',
            telephone_number: '0527 63 39 11',
        },
        groningen: {
            implementation_name: 'Stadjerspas',
            organization_name: 'Groningen',
            website: 'https://stadjerspas.gemeente.groningen.nl',
            contact_email: 'stadjerspas@groningen.nl',
            accessibility_link: 'https://gemeente.groningen.nl/toegankelijkheid',
            telephone_number: '14 050',
        },
        geertruidenberg: {
            implementation_name: 'Kindregelingen',
            organization_name: 'Geertruidenberg',
            website: 'https://kindregeling.geertruidenberg.nl',
            contact_email: 'communicatie@geertruidenberg.nl',
            accessibility_link: 'https://www.geertruidenberg.nl/en/node/781',
            telephone_number: '14 0162',
        },
    },
    content: {
        introParagraph1:
            'Gemeente {{organization_name}} streeft naar het toegankelijk maken van de eigen online informatie en dienstverlening, in overeenstemming met Tijdelijk besluit digitale toegankelijkheid overheid.',
        introParagraph2:
            'Deze toegankelijkheidsverklaring is van toepassing op de inhoud van de website {{implementation_name}} {{organization_name}} die valt binnen de werkingssfeer van Tijdelijk besluit digitale toegankelijkheid overheid.',
        linksIntro:
            'De links waarop de inhoud van de website {{implementation_name}} {{organization_name}} te vinden is:',
        mainDomainTitle: 'het hoofddomein:',
        accessibilityOverview:
            'Een actueel en volledig overzicht van de toegankelijkheidsverklaringen die vallen onder de verantwoordelijkheid van Gemeente {{organization_name}} is beschikbaar via de volgende link: ',

        complianceStatusTitle: 'Nalevingsstatus',
        complianceStatusDescription1:
            'Gemeente {{organization_name}} verklaart dat deze website gedeeltelijk voldoet aan Tijdelijk besluit digitale toegankelijkheid overheid.',
        complianceStatusDescription2:
            'Uit toegankelijkheidsonderzoek is gebleken dat nog niet aan alle eisen wordt voldaan. Voor elke afzonderlijke afwijking van de eisen is de oorzaak bekend en is het gevolg beschreven, zijn maatregelen genomen om de afwijking te kunnen opheffen en is een concrete planning gemaakt waarop de maatregelen zullen zijn uitgevoerd.',
        complianceStatusLinkDescription:
            'Zie onder het kopje <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#toelichting-op-de-nalevingsstatus" target="_blank" rel="noreferrer">Toelichting op de nalevingsstatus</a> voor meer gedetailleerde informatie.',

        declarationTitle: 'Opstelling van deze verklaring',
        declarationDescription1:
            'Deze verklaring is opgesteld op {{date}} met instemming van de verantwoordelijke bestuurder van Gemeente {{organization_name}}.',
        declarationDescription2:
            'De actualiteit, volledigheid en juistheid van deze verklaring zijn voor het laatst herzien op {{revision_date}}.',
        feedbackAndContactTitle: 'Feedback en contactgegevens',
        feedbackAndContactDescription:
            'Loopt u tegen een toegankelijkheidsprobleem aan? Of heeft u een vraag of opmerking over toegankelijkheid?',
        feedbackAndContactEmail:
            'Neem dan contact op via <a href="mailto:{{ contact_email }}">Geertruidenberg</a> of {{telephone_number}}',
        expectationsTitle: 'Wat kunt u van ons verwachten?',
        expectationsList1: 'Binnen 5 werkdagen krijgt u een ontvangstbevestiging.',
        expectationsList2: 'We informeren u over de voortgang en de uitkomst.',
        expectationsList3: 'Binnen 3 weken is uw verzoek afgehandeld.',
        enforcementProcedureTitle: 'Handhavingsprocedure',
        enforcementProcedureDescription1:
            'Bent u niet tevreden met de manier waarop uw klacht is behandeld? Of hebben we niet op tijd gereageerd?',
        enforcementProcedureDescription2:
            'Dan kunt u <a href="https://www.nationaleombudsman.nl/klacht-indienen/uw-klacht">[contact opnemen met de Nationale Ombudsman].</a>',

        explanationComplianceStatusTitle: 'Toelichting op de naleving status',
        explanationComplianceStatusDescription1:
            'In deze paragraaf wordt de claim dat gedeeltelijk aan de in Tijdelijk besluit digitale toegankelijkheid overheid gestelde eisen is voldaan nader onderbouwd.',
        explanationComplianceStatusDescription2:
            'De website {{implementation_name}} {{organization_name}} is onderzocht op toegankelijkheid en uit de rapportage blijkt volgens Gemeente {{organization_name}} dat aan alle onderstaande kenmerken is voldaan:',
        complianceCriteria1:
            'het onderzoek omvat alle inhoud die volgens Tijdelijk besluit digitale toegankelijkheid overheid toegankelijk moet worden gemaakt;',
        complianceCriteria2:
            'het onderzoek is gebaseerd op meet- en onderzoeksgegevens die niet ouder zijn dan 12 maanden;',
        complianceCriteria3:
            'de handmatige evaluatie is uitgevoerd overeenkomstig een adequaat gedocumenteerde evaluatiemethode; <a href="https://w3.org/TR/WCAG-EM/">WCAG-EM</a> of gelijkwaardig;',
        complianceCriteria4:
            'voor de (semi-)automatische tests is een toetsinstrument ingezet dat is gebaseerd op de algoritmen die zijn gedocumenteerd door de <a href="https://act-rules.github.io/pages/about/">Auto-WCAG</a> Community Group;',
        complianceCriteria5:
            'alle onderzoeksresultaten zijn nauwkeurig, eenduidig en op reproduceerbare wijze vastgelegd in een voor mensen leesbaar formaat OF in het machineleesbare formaat <a href="https://www.w3.org/WAI/standards-guidelines/earl/">EARL</a>;',
        complianceCriteria6:
            'voor elke afzonderlijke afwijking op de eisen die tijdens het onderzoek werd gevonden en die niet kon worden hersteld wordt aangegeven:',
        referenceNumber: '[referentienummer]',
        description: 'Beschrijving:[beknopte beschrijving van de afwijking]',
        cause: 'Oorzaak: [reden waarom (nog) niet aan de eis kon worden voldaan]',
        effect: 'Gevolg: [impact van de afwijking voor personen met een functiebeperking]',
        alternative: 'Alternatief: [of een toegankelijk alternatief beschikbaar is. En zo ja, welk]',
        measure: 'Maatregel: [te nemen maatregel(en) om de afwijking op te heffen]',
        disproportionateBurden:
            'mogelijkheid om aan te geven of de uitvoering van de maatregel een <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#onevenredige-last">onevenredige last</a> met zich meebrengt: [ja/nee] [toelichting als het antwoord op de vraag \'ja\' is]',
        planning: 'planning: [uiterste datum waarop de afwijking zal zijn hersteld]',
        deviations:
            '(zie onder het kopje <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#afwijkingen-voldoet-gedeeltelijk">Afwijkingen</a>)',
        available_online:
            'alle evaluatie- en onderzoeksresultaten waarop de claim is gebaseerd zijn online beschikbaar(zie onder het kopje <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#evaluatie-en-onderzoekresultaten-voldoet-gedeeltelijk">Evaluatie- en onderzoekresultaten</a>',

        deviationsTitle: 'Afwijkingen',
        technicalDeviationsTitle: 'Technische afwijkingen',
        sc1_1_1: {
            title: 'SC 1.1.1 - Niet-tekstuele content [niveau A]',
            description:
                'Beschrijving: Een img-element mist een alt-attribuut. (alternatieve tekst voor de afbeelding)',
            cause: 'Oorzaak: Geen alternatieve tekst toegevoegd bij de referentie van de afbeelding.',
            effect: 'Gevolg: Het missen van een alternatieve tekst kan invloed hebben op de functionaliteit van spraak naar tekst hulpmiddelen.',
            alternative: 'Alternatief: Er is geen alternatieve oplossing voor dit probleem.',
            measure: 'Maatregel: De webmasters zullen een alternatieve tekst plaatsen bij de afbeelding.',
            disproportionateBurden: 'brengt de uitvoering van de maatregel een onevenredige last met zich mee? Nee',
            planning: 'planning: 01-06-2020',
        },
        sc4_1_2_1: {
            title: 'SC 4.1.2 - Naam, rol, waarde [niveau A]',
            description:
                'Beschrijving: Anker Element gevonden met een geldig href-attribuut, maar er is geen link inhoud is opgegeven.',
            cause: 'Oorzaak: Geen consequent gebruik van anker elementen',
            effect: 'Gevolg: Er is geen direct nadelig gevolg voor de gebruiker.',
            alternative: 'Alternatief: Er is geen alternatieve oplossing voor dit probleem.',
            measure:
                'Maatregel: De webmaster zullen het anker element opnieuw beoordelen en deze verwijderen of de benodigde informatie opgeven',
            disproportionateBurden: 'brengt de uitvoering van de maatregel een onevenredige last met zich mee? Nee',
            planning: 'planning: 01-06-2020',
        },

        outsideScopeTitle:
            'Inhoud die buiten de werkingssfeer valt van Tijdelijk besluit digitale toegankelijkheid overheid',
        outsideScopeDescription:
            'Zie Artikel 2, tweede lid van het Tijdelijk besluit digitale toegankelijkheid overheid.',
        outsideScopeLink: 'https://zoek.officielebekendmakingen.nl/stb-2018-141.html#d17e165',
    },
};
