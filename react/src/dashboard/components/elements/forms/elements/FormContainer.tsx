import React, { ReactNode } from 'react';

export default function FormContainer({ children }: { children: ReactNode | ReactNode[] }) {
    return (
        <div className="row">
            <div className="col col-md-8 col-md-offset-2 col-xs-12 flex flex-vertical flex-gap">{children}</div>
        </div>
    );
}
