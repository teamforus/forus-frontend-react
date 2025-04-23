import React from 'react';
import 'react-range-slider-input/dist/style.css';
import ReactSlider from 'react-slider';

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
                ariaValuetext={(state) => `Value ${state.valueNow}`}
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
