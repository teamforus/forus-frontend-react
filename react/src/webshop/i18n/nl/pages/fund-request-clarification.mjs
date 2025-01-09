export default {
    // FUND REQUEST VALIDATION CLARIFICATION = fund-request-clarification.pug
    block_title: '{{ fund_name }} aanvulverzoek',
    labels: {
        question: 'Vraag',
        message: 'Bericht',
        attachment: 'Bijlage',
    },
    placeholder: 'Uw bericht...',
    buttons: {
        submit: 'Bevestigen',
        back: 'Terug',
    },
    not_pending: {
        title: 'Aanvraag voltooid',
        desc: 'U heeft al een reactie ingestuurd.',
    },
    done: {
        title: 'Aanvulverzoek verzonden.',
        desc: 'Uw aanvulverzoek is verzonden, u krijgt een e-mail als uw aanvraag is afgehandeld.',
    },
};
