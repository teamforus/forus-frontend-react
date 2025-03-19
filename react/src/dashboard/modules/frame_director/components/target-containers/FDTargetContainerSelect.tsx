import React from 'react';
import classNames from 'classnames';
import useFDOffsetMenu from '../../hooks/useFDOffsetMenu';
import { FDTargetContainerProps } from '../targets/FDTargetClick';

export default function FDTargetContainerSelect(props: FDTargetContainerProps) {
    const { item, content } = props;
    const { ref, itemWidth, itemHeight } = useFDOffsetMenu(item);

    return (
        <div
            style={{ opacity: !itemWidth && !itemHeight ? 0 : 1 }}
            onClick={(e) => e.stopPropagation()}
            className={classNames('form')}>
            <div className="select-control-input" ref={ref}>
                {typeof content === 'function' ? content(props) : content}
            </div>
        </div>
    );
}
