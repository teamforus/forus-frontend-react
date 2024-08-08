import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import ScrollEnd from '../elements/scroll-end/ScrollEnd';
import ToggleControl from '../elements/forms/controls/ToggleControl';

type ItemProp = {
    value: string;
    blink?: boolean;
    model?: boolean;
    columns?: Array<string>;
};

export default function ModalDuplicatesPicker({
    modal,
    className,
    hero_icon = 'alert-outline',
    hero_title = '',
    hero_subtitle = '',
    enableToggles = true,
    label_on = '',
    label_off = '',
    items,
    onConfirm,
    onCancel,
    button_cancel = 'Annuleren',
    button_none = 'Alles overslaan',
    button_all = 'Ja op alles',
    button_confirm = 'Bevestigen',
}: {
    modal: ModalState;
    className?: string;
    hero_icon?: string;
    hero_title?: string;
    hero_subtitle: string | Array<string>;
    enableToggles: boolean;
    label_on: string;
    label_off: string;
    items: Array<ItemProp>;
    onConfirm: (list: Array<{ value: string; blink?: boolean; model?: boolean }>) => void;
    onCancel: () => void;
    button_cancel?: string;
    button_none?: string;
    button_all?: string;
    button_confirm?: string;
}) {
    const [list, setList] = useState<Array<ItemProp>>([...items]);
    const [listShown, setListShown] = useState<Array<ItemProp>>([]);

    const [labels] = useState({
        label_on,
        label_off,
        button_cancel,
        button_none,
        button_all,
        button_confirm,
    });

    const [page, setPage] = useState(1);
    const [per_page] = useState(25);

    const blink = useCallback((index: Array<number>) => {
        setListShown((listShown) => {
            index.forEach((i) => {
                listShown[i].blink = true;
            });
            return [...listShown];
        });

        window.setTimeout(() => {
            setListShown((listShown) => {
                index.forEach((i) => {
                    listShown[i].blink = false;
                });
                return [...listShown];
            });
        }, 350);
    }, []);

    const toggleAllOff = useCallback(() => {
        setList((list) => {
            list.forEach((item) => {
                item.model = false;
            });

            return [...list];
        });

        setListShown((list) => {
            list.forEach((item) => {
                item.model = false;
            });

            return [...list];
        });

        blink(listShown.map((_, index) => index));
    }, [listShown, blink]);

    const toggleAllOn = useCallback(() => {
        setList((list) => {
            list.forEach((item) => {
                item.model = true;
            });

            return [...list];
        });

        setListShown((list) => {
            list.forEach((item) => {
                item.model = true;
            });

            return [...list];
        });

        blink(listShown.map((_, index) => index));
    }, [listShown, blink]);

    const confirm = useCallback(() => {
        if (list.length === 1) {
            list[0].model = true;
        }

        onConfirm(list.filter((item) => item.model));
        modal.close();
    }, [list, modal, onConfirm]);

    const cancel = useCallback(() => {
        onCancel();
        modal.close();
    }, [modal, onCancel]);

    const loadMore = useCallback(() => {
        setPage((page) => page + 1);
    }, []);

    useEffect(() => {
        setListShown((listShown) => {
            if (listShown.length < list.length) {
                return list.slice(0, per_page * page);
            }

            return [...listShown];
        });
    }, [list, page, per_page]);

    return (
        <div className={`modal modal-xl modal-animated ${modal.loading ? 'modal-loading' : ''} ${className || ''}`}>
            <div className="modal-backdrop" onClick={cancel} />
            <div className="modal-window">
                <div className="modal-body">
                    <div className="modal-hero">
                        <div className="hero-icon">
                            <em className={`mdi ${hero_icon ? `mdi-${hero_icon}` : ''}`} />
                        </div>

                        {hero_title && <div className="hero-title">{hero_title}</div>}

                        {(Array.isArray(hero_subtitle) ? hero_subtitle : [hero_subtitle]).map((subtitle, index) => (
                            <div key={index} className="hero-subtitle">
                                {subtitle}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-close mdi mdi-close" role="button" onClick={cancel} />
                <div className="modal-body modal-body-padless form">
                    <ScrollEnd onScrollEnd={() => loadMore()} className="block block-switch-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    {listShown.map((item, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => {
                                                item.model = !item.model;
                                                blink([index]);
                                            }}
                                            className={
                                                !(enableToggles && listShown.length > 1) ? 'switch-row-disabled' : null
                                            }>
                                            <td>
                                                <em className="mdi mdi-alert-outline text-warning switch-key-icon" />
                                                <span>{item.value}</span>
                                            </td>

                                            {item?.columns?.map((column, index) => <td key={index}>{column}</td>)}

                                            {enableToggles && listShown.length > 1 && (
                                                <td>
                                                    <div className="switch-input">
                                                        <div
                                                            className={`switch-input-label ${
                                                                item.blink ? 'switch-input-label-blink' : ''
                                                            }`}>
                                                            {item.model ? labels.label_on : labels.label_off}
                                                        </div>
                                                        <div className="switch-input-control">
                                                            <div className="form-group form-group-inline">
                                                                <ToggleControl
                                                                    checked={item.model || false}
                                                                    onChange={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        item.model = !item.model;
                                                                        blink([index]);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollEnd>
                </div>

                <div className="modal-footer text-center">
                    <div className="button-group flex-grow">
                        <button className="button button-default button-sm" onClick={cancel}>
                            {labels.button_cancel}
                        </button>
                    </div>
                    <div className="button-group">
                        {enableToggles && list.length > 1 && (
                            <button className="button button-default button-sm" onClick={toggleAllOff}>
                                {labels.button_none}
                            </button>
                        )}
                        {enableToggles && list.length > 1 && (
                            <button className="button button-default button-sm" onClick={toggleAllOn}>
                                {labels.button_all}
                            </button>
                        )}
                        <button className="button button-primary button-sm" onClick={confirm}>
                            {labels.button_confirm}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
