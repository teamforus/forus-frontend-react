import React, { ReactNode } from 'react';
import FDTargetClick, {
    FDTargetContainerProps,
} from '../../../modules/frame_director/components/targets/FDTargetClick';
import FDTargetContainerTableMenu from '../../../modules/frame_director/components/target-containers/FDTargetContainerTableMenu';

export default function TableRowActions({
    content,
    buttons = null,
    dataDusk,
    disabled = false,
}: {
    content: (e: FDTargetContainerProps) => ReactNode;
    buttons?: ReactNode | ReactNode[];
    dataDusk?: string;
    disabled?: boolean;
}) {
    return (
        <div className="table-td-actions-buttons">
            {buttons}
            {disabled ? (
                <button className="button button-text button-menu" data-dusk={dataDusk} disabled={true}>
                    <em className="mdi mdi-dots-vertical" />
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
                        <em className="mdi mdi-dots-vertical" />
                    </button>
                </FDTargetClick>
            )}
        </div>
    );
}
