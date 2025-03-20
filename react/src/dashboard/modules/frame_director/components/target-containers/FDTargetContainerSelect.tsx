import React from 'react';
import classNames from 'classnames';
import useFDOffsetMenu from '../../hooks/useFDOffsetMenu';
import { FDTargetContainerProps } from '../targets/FDTargetClick';

export default function FDTargetContainerSelect(props: FDTargetContainerProps) {
    const { item, content } = props;
    const { ref } = useFDOffsetMenu(item);

    return (
        <div onClick={(e) => e.stopPropagation()} className={classNames('form')}>
            <div className="select-control-input" ref={ref}>
                {typeof content === 'function' ? content(props) : content}
            </div>
        </div>
    );
}
