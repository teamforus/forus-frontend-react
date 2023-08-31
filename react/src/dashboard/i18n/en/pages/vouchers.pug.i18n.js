module.exports = {
    header: {
        title: "Vouchers",
    },
    labels: {
        state: "Status",
        activation_code: "Code",
        amount: "Bedrag",
        created_date: "Aangemaakt op",
        expire_date: "Geldig tot en met",
        fund: "Fonds",
        granted: "Toegekend",
        note: "Notitie",
        search: "Zoeken",
        qr_code: "QR-Code",
        pending: 'Pending',
        active: 'Active',
        deactivated: 'Deactivated',
        date_type: 'Pas toe op',
        used_date: 'Used date',
    },
    buttons: {
        add_new: "Aanmaken"
    },
    events: {
        created_budget: 'Created',
        created_product: 'Created',
        activated: 'Activated',
        deactivated: 'Deactivated',
    },
    csv: {
        default_note: "Uploaded at {{ upload_date }} by {{ uploader_email }}, assigned to {{ target_email }}",
        default_note_no_email: "Uploaded at {{ upload_date }} by {{ uploader_email }}",
    }
};