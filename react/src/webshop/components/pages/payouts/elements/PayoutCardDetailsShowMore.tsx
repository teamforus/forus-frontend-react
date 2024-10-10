import React from 'react';

export default function PayoutCardDetailsShowMore({
    showMore,
    setShowMore,
}: {
    showMore: boolean;
    setShowMore: (showMore: boolean) => void;
}) {
    return (
        <button
            type={'button'}
            className="button button-text button-xs payout-read-more"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMore(!showMore);
            }}
            aria-expanded={showMore}
            aria-controls="payout-details-extra">
            {showMore ? 'Minder informatie' : 'Meer informatie'}
            <em className={`mdi ${showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'} icon-right`} />
        </button>
    );
}
