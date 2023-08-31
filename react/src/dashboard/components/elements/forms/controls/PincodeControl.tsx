import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import { chunk } from 'lodash';

interface CheckboxProps {
    id?: string;
    title?: string;
    value?: string;
    valueType?: 'alphaNum' | 'alpha' | 'num';
    onChange: (value: string) => void;
    blockSize?: number;
    blockCount?: number;
    cantDeleteSize?: number;
    className?: string;
}

export default function PincodeControl({
    id,
    title,
    value,
    valueType = 'num',
    onChange,
    blockSize = 6,
    blockCount = 1,
    cantDeleteSize = 0,
    className,
}: CheckboxProps) {
    const totalSize = blockSize * blockCount;
    const immutableSize = Math.min(cantDeleteSize, value.length);

    const chars = useMemo<Array<{ val: string }>>(() => {
        return value
            .padEnd(totalSize, ' ')
            .split('')
            .map((val) => ({ val: val.trim() }));
    }, [totalSize, value]);

    const charChunks = useMemo(() => chunk(chars, blockSize), [chars, blockSize]);

    const [inputRefs] = useState([...new Array(totalSize)].map(() => createRef<HTMLInputElement>()));
    const [cursor, setCursor] = useState(Math.max(0, immutableSize));

    const [pattern] = useState({
        num: /^[0-9]+$/,
        alpha: /^[a-zA-Z]+$/,
        alphaNum: /^[0-9a-zA-Z]+$/,
    });

    const isValid = useCallback(
        (char: string, type: 'alphaNum' | 'alpha' | 'num') => {
            if (type == 'alphaNum') {
                return new RegExp(pattern.alphaNum).test(char);
            }

            if (type == 'alpha') {
                return new RegExp(pattern.alpha).test(char);
            }

            if (type == 'num') {
                return new RegExp(pattern.num).test(char);
            }

            return false;
        },
        [pattern.num, pattern.alpha, pattern.alphaNum],
    );

    const setText = useCallback(
        (text: string) => {
            const suffix = value.substring(0, immutableSize);
            const textValue = text.substring(immutableSize, totalSize);

            onChange(suffix + textValue);
        },
        [immutableSize, onChange, totalSize, value],
    );

    const selectInputRange = useCallback((input?: HTMLInputElement) => {
        input?.setSelectionRange(0, input?.value.length);
        window.setTimeout(() => input?.setSelectionRange(0, input?.value.length), 0);
    }, []);

    useEffect(() => {
        inputRefs[cursor].current?.focus();
    }, [cursor, inputRefs]);

    return (
        <div
            id={id}
            title={title}
            className={`block block-pincode ${className || ''}`}
            onClick={() => inputRefs[cursor].current?.focus()}>
            <div className="flex flex-vertical">
                <div className="flex">
                    {charChunks.map((charChunk, nthChunk) => (
                        <div key={nthChunk} className={'flex'}>
                            <div>
                                {charChunk.map((char, nth) => (
                                    <input
                                        id={`char_${nthChunk}_${nth}`}
                                        key={nth}
                                        className={'pincode-number'}
                                        type={valueType === 'num' ? 'tel' : 'text'}
                                        autoCorrect="disabled"
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        disabled={chars.indexOf(char) < immutableSize}
                                        ref={inputRefs[chars.indexOf(char)]}
                                        value={char.val}
                                        onFocus={(e) => {
                                            e.target.placeholder = '';
                                            selectInputRange(e.target);
                                        }}
                                        onBlur={(e) => (e.target.placeholder = '_')}
                                        placeholder={'_'}
                                        onKeyDown={(e) => {
                                            const index = chars.indexOf(char);
                                            const arr = value.split('');
                                            const hasText = inputRefs[index].current.value.length > 0;

                                            if (e.key == 'Backspace') {
                                                e.preventDefault();
                                                arr[index] = ' ';

                                                if (!hasText) {
                                                    arr[index - 1] = ' ';
                                                }

                                                setText(arr.join(''));
                                                setCursor(Math.max(immutableSize, hasText ? index : index - 1));
                                            }

                                            if (e.key == 'ArrowLeft') {
                                                e.preventDefault();
                                                setCursor(Math.max(immutableSize, index - 1));
                                            }

                                            if (e.key == 'ArrowRight') {
                                                e.preventDefault();
                                                setCursor(Math.min(chars.length - 1, index + 1));
                                            }

                                            if (e.currentTarget.value == e.key) {
                                                e.preventDefault();
                                                setCursor(Math.min(chars.length - 1, index + 1));
                                            }
                                        }}
                                        onChange={(e) => {
                                            const index = chars.indexOf(char);
                                            const targetValue = e.target.value;

                                            const text = targetValue
                                                .substring(0)
                                                .split('')
                                                .map((item) => {
                                                    return isValid(item, valueType) ? item : '';
                                                })
                                                .join('');

                                            const newText =
                                                value.substring(0, index).padEnd(index, ' ') +
                                                text +
                                                value.substring(index + text.length, value.length);

                                            setText(newText);

                                            if (cursor !== Math.min(totalSize - 1, index + text.length)) {
                                                setCursor(Math.min(totalSize - 1, index + text.length));
                                            } else {
                                                selectInputRange(e.target);
                                            }
                                        }}
                                        onClick={(e) => {
                                            const index = chars.indexOf(char);
                                            e.stopPropagation();
                                            setCursor(index);
                                        }}
                                    />
                                ))}
                            </div>
                            {nthChunk < charChunks.length - 1 && (
                                <div className="pincode-number pincode-number-divider" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
