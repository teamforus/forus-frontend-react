import React, { ReactNode } from 'react';
import FDTargetClick, {
    FDTargetContainerProps,
} from '../../../modules/frame_director/components/targets/FDTargetClick';
import FDTargetContainerTableMenu from '../../../modules/frame_director/components/target-containers/FDTargetContainerTableMenu';

export default function TableRowActions({ content }: { content: (e: FDTargetContainerProps) => ReactNode }) {
    return (
        <div className={`actions`}>
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
                <div className="button button-text button-menu">
                    <em className="mdi mdi-dots-horizontal" />
                </div>
            </FDTargetClick>
        </div>
    );
}
