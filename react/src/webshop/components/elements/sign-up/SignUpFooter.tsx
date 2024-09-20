import React, { Fragment, ReactNode } from 'react';

export default function SignUpFooter({
    startActions,
    endActions,
}: {
    startActions?: ReactNode;
    endActions?: ReactNode;
}) {
    return (
        <div className="sign_up-pane-footer">
            <div className="flex flex-horizontal flex-center">
                <div className="flex flex-grow">{startActions || <Fragment>&nbsp;</Fragment>}</div>
                <div className="flex">{endActions || <Fragment>&nbsp;</Fragment>}</div>
            </div>
        </div>
    );
}
