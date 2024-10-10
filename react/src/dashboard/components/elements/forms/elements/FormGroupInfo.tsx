import React, { Fragment, ReactNode, useState } from 'react';

export default function FormGroupInfo({
    info,
    children,
}: {
    info: ReactNode;
    children: React.ReactElement | Array<React.ReactElement>;
}) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <Fragment>
            <div className="form-group-info">
                <div className="form-group-info-control">{children}</div>
                <div className="form-group-info-button">
                    <div
                        onClick={() => setShowInfo(!showInfo)}
                        className={`button button-default button-icon pull-left ${showInfo ? 'active' : ''}`}>
                        <em className="mdi mdi-information" />
                    </div>
                </div>
            </div>
            {showInfo && (
                <div className="block block-info-box block-info-box-primary">
                    <div className="info-box-icon mdi mdi-information" />
                    <div className="info-box-content">
                        <div className="block block-markdown">
                            {typeof info === 'string'
                                ? info.split('\n').map((line, index) => <div key={index}>{line}</div>)
                                : info}
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
