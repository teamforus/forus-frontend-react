import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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
    const value: [number, number] = [from ?? min ?? 0, to ?? max ?? 0];

    const formatAriaValue = (sliderValue: number) => {
        return translate('form.range_control.aria_value', {
            prefix: prefix?.trim(),
            value: sliderValue,
            min,
            max,
        });
    };

    return (
        <div className="range-control">
            <Slider
                min={min}
                max={max}
                range
                value={value}
                onChange={(nextValue) => {
                    const [nextFrom, nextTo] = Array.isArray(nextValue) ? nextValue : [nextValue, nextValue];

                    setTo?.(nextTo);
                    setFrom?.(nextFrom);
                }}
                className="range-control-slider"
                allowCross={false}
                pushable={0}
                ariaLabelForHandle={[
                    translate('form.range_control.first_slider_aria_label'),
                    translate('form.range_control.second_slider_aria_label'),
                ]}
                ariaValueTextFormatterForHandle={[formatAriaValue, formatAriaValue]}
                handleRender={(node, { value: sliderValue }) =>
                    React.cloneElement(
                        node,
                        node.props,
                        <>
                            {node.props.children}
                            <div className="range-control-thumb-text">{`${prefix}${sliderValue}`}</div>
                        </>,
                    )
                }
            />
        </div>
    );
}
