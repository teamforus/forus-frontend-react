import React, { Fragment, ReactNode } from 'react';

export default function LoadingCard({ type = 'card' }: { type?: 'card' | 'card-section' }) {
    const Wrapper = ({ children }: { children: ReactNode }) => {
        return type == 'card' ? <div className={'card'}>{children}</div> : <Fragment>{children}</Fragment>;
    };

    return (
        <Wrapper>
            <div className="card-section">
                <div className="card-loading">
                    <em className="mdi mdi-loading mdi-spin" />
                </div>
            </div>
        </Wrapper>
    );
}
