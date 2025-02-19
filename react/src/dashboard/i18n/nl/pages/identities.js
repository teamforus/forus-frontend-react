export default {
    header: {
        title: 'Personen',
    },
    labels: {
        id: 'ID',
        given_name: 'Voornaam',
        family_name: 'Achternaam',
        email: 'E-mail adres',
        bsn: 'BSN',
        client_number: 'Klantnummer',
        birth_date: 'Geboorte datum',
        last_activity: 'Laatste inlog',
        postal_code: 'Postcode',
        vouchers_count: 'Aantal tegoeden',
        mobile: 'Mobiele telefoonnummer',
        city: 'Woonplaats',
        house_number: 'Huisnummer',
        house_number_addition: 'Huisnummer toevoeging',
        municipality_name: 'Gemeentenaam',
        neighborhood_name: 'Woonwijk',
        street: 'Straatnaam',
        created_at: 'Gemaakt op',
        actions: 'Acties',
    },
    tooltips: {
        id: 'Dit is een unieke identificatiecode die automatisch wordt gegenereerd voor elke persoon in het systeem. Het helpt om elke persoon individueel te identificeren.',
        given_name:
            'Dit veld bevat de voornaam van de persoon. Het is belangrijk voor persoonlijke communicatie en identificatie.',
        family_name:
            'Dit veld bevat de achternaam van de persoon. Samen met de voornaam zorgt dit voor een volledige naamweergave.',
        email: 'Dit veld bevat het e-mailadres van de persoon. Het wordt gebruikt voor communicatie en meldingen binnen het platform en dient tevens als inlogmethode.',
        bsn: 'Dit staat voor "Burger Service Nummer". Het is een uniek identificatienummer dat wordt gebruikt door de overheid om personen te identificeren in verschillende administratieve processen.',
        client_number:
            'Uniek nummer toegekend door het systeem van de organisatie, zodat een relatie kan worden geïdentificeerd. Ook wel Persoon-organisatierelatie ID (UID) genoemd.',
        birth_date:
            'Dit veld bevat de geboortedatum van de persoon. Het is belangrijk voor persoonlijke identificatie, ondersteuning bij het gebruik, en om per regio inzicht te krijgen in de aanvraag en het gebruik van regelingen.',
        last_activity:
            'Dit veld toont de datum en tijd waarop de persoon voor het laatst heeft ingelogd op het platform. Dit helpt om de activiteit van de persoon te monitoren.',
        postal_code:
            'Dit veld bevat de postcode van de persoon. Dit helpt bij persoonlijke identificatie, ondersteuning bij het gebruik, en om per regio inzicht te krijgen in de aanvraag en het gebruik van regelingen.',
        vouchers_count:
            'Dit veld toont het aantal tegoeden (vouchers) dat momenteel aan de persoon is toegekend. Dit geeft inzicht in de financiële of materiële ondersteuning die de persoon heeft ontvangen via het platform.',
        mobile: 'Mobiele telefoonnummer',
        city: 'Dit veld bevat de woonplaats van de persoon. Het helpt bij persoonlijke identificatie, ondersteuning bij het gebruik, en om per regio inzicht te krijgen in de aanvraag en het gebruik van regelingen.',
        house_number:
            'Een numerieke aanduiding die door de gemeente aan een object is toegekend (volgens NEN 5825:2002).',
        house_number_addition: 'Extra toevoegingen aan het huisnummer, zoals toegekend door de gemeente.',
        municipality_name: 'De naam van de wijk, zoals die door het CBS wordt gebruikt.',
        neighborhood_name:
            'De samenstelling van het huishouden, inclusief het aantal en de relaties van personen die samenwonen.',
        street: 'De officiële, door de gemeente vastgestelde naam van een straat.',
        created_at: 'Gemaakt op',
    },
    bank_accounts: {
        labels: {
            iban: 'IBAN',
            iban_name: 'Te naam stelling',
            updated_at: 'Laatst aangepast',
            created_by: 'Verkregen via',
        },
        tooltips: {
            iban: 'IBAN',
            iban_name: 'Te naam stelling',
            updated_at: 'Laatst aangepast',
            created_by: 'Verkregen via',
        },
    },
    record_info: {
        client_number:
            'Uniek nummer toegekend door het systeem van de organisatie, zodat een relatie kan worden geïdentificeerd. Ook wel Persoon-organisatierelatie ID (UID) genoemd.',
        given_name: 'De samenvoeging van alle exemplaren van voornaam van de persoon.',
        family_name: 'De familienaam of geslachtsnaam die aangeeft dat de persoon tot een specifieke familie behoort.',
        email: 'Het adres waaronder de persoon per elektronische post bereikbaar is. Dit is het hoofd e-mailadres van de persoon en wordt gebruikt om in te loggen op de website en systeemberichten te ontvangen.',
        emails_verified_0:
            'Het eerste extra adres waaronder de persoon per elektronische post bereikbaar is. Dit is het eerste extra e-mailadres. De persoon kan het e-mailadres als hoofdadres instellen in het persoonlijke account op de website.',
        emails_verified_1:
            'Het tweede extra adres waaronder de persoon per elektronische post bereikbaar is. Dit is het eerste extra e-mailadres. De persoon kan het e-mailadres als hoofdadres instellen in het persoonlijke account op de website.',
        emails_verified_2:
            'Het tweede extra adres waaronder de persoon per elektronische post bereikbaar is. Dit is het eerste extra e-mailadres. De persoon kan het e-mailadres als hoofdadres instellen in het persoonlijke account op de website.',
        emails_verified_3:
            'Het tweede extra adres waaronder de persoon per elektronische post bereikbaar is. Dit is het eerste extra e-mailadres. De persoon kan het e-mailadres als hoofdadres instellen in het persoonlijke account op de website.',
        birth_date: 'De datum van geboorte van de persoon.',
        postal_code:
            'De officiële codering van TNT Post voor een Nederlands postadres, bestaande uit een numeriek deel en een alfabetisch deel.',
        telephone: 'Het telefoonnummer waaronder de persoon bereikbaar is.',
        mobile: 'Het mobiele telefoonnummer waaronder de persoon bereikbaar is.',
        city: '"De naam van een door het bevoegde gemeentelijke orgaan als zodanig aangewezen gedeelte van het gemeentelijk grondgebied.',
        house_number: 'De numerieke aanduiding zoals deze door de gemeente aan het object is toegekend.',
        house_number_addition: 'De huisnummertoevoeging zoals deze door de gemeente aan het object is toegekend.',
        street: 'De officiële door de gemeente vastgestelde naam van een straat waar de persoon woonachtig is.',
        house_composition:
            'De samenstelling van het huishouden, inclusief het aantal en de relaties van personen die samenwonen.',
        gender: 'Een aanduiding die aangeeft of de ingeschrevene een man of vrouw is, of dat het geslacht onbekend is.',
        age: 'De leeftijd van de persoon in jaren.',
        municipality_name: 'De officiële door de gemeente vastgestelde Gemeentenaam.',
        neighborhood_name: 'De naam van de wijk, zoals die door het CBS wordt gebruikt.',
        living_arrangement:
            'De manier waarop de persoon samenleeft binnen een huishouden, zoals alleenstaanden, gezinnen, of woongroepen.',
        marital_status: 'De rechtstoestand van een persoon ten aanzien van huwelijk of geregistreerd partnerschap.',
    },
    bank_account: {
        iban: {
            label: 'IBAN-nummer',
            tooltip: 'Bankrekeningnummer (IBAN)',
        },
        iban_name: {
            label: 'Te naam stelling',
            tooltip: 'Tenaamstelling',
        },
    },
    buttons: {
        clear_filter: 'Wis filter',
    },
};
