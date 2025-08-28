import React from 'react';
import 'react-range-slider-input/dist/style.css';
import ReactSlider from 'react-slider';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function RangeControl({
    from,
    to,
    setTo,
    setFrom,
    min,
    max,
    prefix = '',
}: {
    from?: number;
    setFrom?: (from: number) => void;
    to?: number;
    setTo?: (to: number) => void;
    min?: number;
    max?: number;
    prefix?: string;
}) {
    const translate = useTranslate();

    return (
        <div className="range-control">
            <ReactSlider
                min={min}
                max={max}
                value={[from, to]}
                onChange={([_from, _to]) => {
                    setTo(_to);
                    setFrom(_from);
                }}
                className="horizontal-slider"
                thumbClassName="horizontal-slider-thumb"
                trackClassName="horizontal-slider-track"
                ariaLabelledby={['first-slider-label', 'second-slider-label']}
                ariaValuetext={(state) => {
                    return translate('form.range_control.aria_value', {
                        prefix: prefix?.trim(),
                        value: state.valueNow,
                        min,
                        max,
                    });
                }}
                renderThumb={(props, state) => (
                    <div {...props}>
                        <div className="horizontal-slider-thumb-text">{`${prefix}${state.valueNow}`}</div>
                    </div>
                )}
                pearling
                minDistance={0}
            />
        </div>
    );
}
