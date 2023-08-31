import React from 'react';

export default function LoadingCard() {
    return (
        <div className="card">
            <div className="card-section">
                <div className="card-loading">
                    <em className="mdi mdi-loading mdi-spin" />
                </div>
            </div>
        </div>
    );
}
