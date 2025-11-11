import React, { ReactNode } from 'react';

export default function PaneGroup({ children }: { children: ReactNode | ReactNode[] }) {
    return <div className="block block-panel-group">{children}</div>;
}
