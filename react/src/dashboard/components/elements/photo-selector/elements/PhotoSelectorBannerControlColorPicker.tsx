import React, { CSSProperties, Fragment } from 'react';
import {
    type HsvaColor,
    hsvaToRgbaString,
    color as handleColor,
    validHex,
    hexToHsva,
    hsvaToHex,
    hsvaToHexa,
    ColorResult,
} from '@uiw/color-convert';
import Saturation from '@uiw/react-color-saturation';
import Hue from '@uiw/react-color-hue';
import Alpha from '@uiw/react-color-alpha';
import EditableInput from '@uiw/react-color-editable-input';
import EditableInputRGBA from '@uiw/react-color-editable-input-rgba';

export default function PhotoSelectorBannerControlColorPicker({
    showAlpha = false,
    color,
    showEditableInput = true,
    showColorPreview,
    showHue = true,
    onChange,
    style,
    alphaFractions,
}: {
    showAlpha?: boolean;
    color: string;
    style?: CSSProperties | undefined;
    showEditableInput?: boolean;
    showColorPreview?: boolean;
    showHue?: boolean;
    alphaFractions?: number;
    onChange?: (color: ColorResult) => void;
}) {
    const hsva = (
        typeof color === 'string' && validHex(color) ? hexToHsva(color) : color || { h: 0, s: 0, l: 0, a: 0 }
    ) as HsvaColor;

    const inputStyle: React.CSSProperties = {
        textAlign: 'left',
        padding: '4px 10px',
        outline: 'none',
        font: '500 13px/20px var(--base-font)',
    };

    const handleChange = (hsv: HsvaColor) => {
        onChange?.(handleColor({ ...hsv, a: alphaFractions ? roundToNearestFraction(hsv.a, alphaFractions) : hsv.a }));
    };

    const roundToNearestFraction = (num: number, factor: number) => {
        // Clamp the input between 0 and 1
        if (num < 0) num = 0;
        if (num > 1) num = 1;

        // Multiply by the factor, round to the nearest integer, then divide by the factor
        return Math.round(num * factor) / factor;
    };

    const alphaStyle = {
        '--chrome-alpha-box-shadow': 'rgb(0 0 0 / 25%) 0px 0px 1px inset',
        borderRadius: '50%',
        background: hsvaToRgbaString(hsva),
        boxShadow: 'var(--chrome-alpha-box-shadow)',
    };
    const styleSize = { height: 14, width: 14 };

    const pointerProps = {
        style: { ...styleSize },
        fillProps: { style: styleSize },
    };

    return (
        <div className={'block block-color-picker'} style={style}>
            <Saturation
                hsva={hsva}
                style={{ width: '100%', height: '140px' }}
                className={'color-picker-saturation'}
                onChange={(newColor) => {
                    handleChange({ ...hsva, ...newColor, a: hsva.a });
                }}
            />
            <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                {showColorPreview && (
                    <Alpha
                        width={28}
                        height={28}
                        hsva={hsva}
                        radius={2}
                        style={{ borderRadius: '50%' }}
                        bgProps={{ style: { background: 'transparent' } }}
                        innerProps={{ style: alphaStyle }}
                        pointer={() => <Fragment />}
                    />
                )}
                <div style={{ flex: 1 }}>
                    {showHue == true && (
                        <Hue
                            hue={hsva.h}
                            style={{ width: '100%', height: '12px', borderRadius: 2 }}
                            pointerProps={pointerProps}
                            bgProps={{ style: { borderRadius: 2 } }}
                            onChange={(newHue) => handleChange({ ...hsva, ...newHue })}
                        />
                    )}
                    {showAlpha == true && (
                        <Alpha
                            hsva={hsva}
                            style={{ marginTop: 6, height: 12, borderRadius: 2 }}
                            pointerProps={pointerProps}
                            bgProps={{ style: { borderRadius: 2 } }}
                            onChange={(newAlpha) => handleChange({ ...hsva, ...newAlpha })}
                        />
                    )}
                </div>
            </div>
            {showEditableInput && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '0 0',
                        userSelect: 'none',
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <div
                                style={{
                                    flex: '0 0 25px',
                                    font: '600 11px/20px var(--base-font)',
                                    color: 'var(--color-primary)',
                                }}>
                                HEX
                            </div>
                            <EditableInput
                                inputStyle={{ ...inputStyle, width: '100%' }}
                                value={
                                    hsva.a > 0 && hsva.a < 1
                                        ? hsvaToHexa(hsva).toLocaleUpperCase()
                                        : hsvaToHex(hsva).toLocaleUpperCase()
                                }
                                onChange={(_, value) => {
                                    if (typeof value === 'string') {
                                        handleChange(hexToHsva(/^#/.test(value) ? value : `#${value}`));
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <div
                                style={{
                                    flex: '0 0 25px',
                                    font: '600 11px/20px var(--base-font)',
                                    color: 'var(--color-primary)',
                                }}>
                                RGB
                            </div>
                            <EditableInputRGBA
                                hsva={hsva}
                                rProps={{ inputStyle, label: null }}
                                gProps={{ inputStyle, label: null }}
                                bProps={{ inputStyle, label: null }}
                                aProps={showAlpha == false ? false : { inputStyle, label: null }}
                                onChange={(reColor) => handleChange(reColor.hsva)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
