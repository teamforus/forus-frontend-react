import React, { ReactNode } from 'react';
import FDTargetClick, {
    FDTargetContainerProps,
} from '../../../modules/frame_director/components/targets/FDTargetClick';
import FDTargetContainerTableMenu from '../../../modules/frame_director/components/target-containers/FDTargetContainerTableMenu';

export default function TableRowActions({
    content,
    dataDusk,
    disabled = false,
}: {
    content: (e: FDTargetContainerProps) => ReactNode;
    dataDusk?: string;
    disabled?: boolean;
}) {
    return (
        <div className={`actions`}>
            {disabled ? (
                <button className="button button-text button-menu" data-dusk={dataDusk} disabled={true}>
                    <em className="mdi mdi-dots-horizontal" />
                </button>
            ) : (
                <FDTargetClick
                    position={'bottom'}
                    align={'end'}
                    contentContainer={FDTargetContainerTableMenu}
                    content={(e) => (
                        <div className="menu-dropdown">
                            <div className="menu-dropdown-arrow" />
                            {content(e)}
                        </div>
                    )}>
                    <button className="button button-text button-menu" data-dusk={dataDusk}>
                        <em className="mdi mdi-dots-horizontal" />
                    </button>
                </FDTargetClick>
            )}
        </div>
    );
}
