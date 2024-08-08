import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export default function TableTopScroller({
    children,
    scrollableRootSelector = '.app',
}: {
    children: ReactElement | ReactElement[];
    scrollableRootSelector?: string;
}) {
    const tableScrollTopRef = useRef<HTMLDivElement>(null);
    const tableScrollWrapperRef = useRef<HTMLDivElement>(null);
    const tableScrollTopContentRef = useRef<HTMLDivElement>(null);

    const [showTopScroll, setShowTopScroll] = useState(false);

    const handleResize = useCallback((enabled = true) => {
        if (enabled && tableScrollTopRef.current && tableScrollWrapperRef.current) {
            tableScrollTopRef.current.style.width = `${tableScrollWrapperRef.current.offsetWidth}px`;
            tableScrollTopContentRef.current.style.width = `${tableScrollWrapperRef.current.scrollWidth}px`;
            tableScrollTopContentRef.current.style.height = `1px`;
        }
    }, []);

    const handlePositionChange = useCallback(() => {
        const rect = tableScrollWrapperRef?.current?.getBoundingClientRect();
        const screenHeight = window.innerHeight;

        setShowTopScroll(rect && rect?.bottom > screenHeight);
    }, []);

    const updateState = useCallback(() => {
        handleResize();
        handlePositionChange();
    }, [handlePositionChange, handleResize]);

    useEffect(() => {
        const appRoot = document.querySelector(scrollableRootSelector);

        if (!appRoot) {
            return;
        }

        updateState();

        window.addEventListener('resize', updateState);
        appRoot.addEventListener('scroll', updateState);

        const observer = new MutationObserver(updateState);

        if (tableScrollWrapperRef.current) {
            const options = {
                childList: true,
                subtree: true,
                characterData: true,
            };

            observer.observe(tableScrollWrapperRef.current, options);
            observer.observe(appRoot, options);
            observer.observe(document.body, options);
        }

        // Cleanup event listener and observer on component unmount
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateState);
            appRoot.removeEventListener('scroll', updateState);
        };
    }, [scrollableRootSelector, updateState]);

    return (
        <div className="table-wrapper">
            <div className={classNames('table-container', showTopScroll && 'table-container-scroll-top')}>
                {showTopScroll && (
                    <div
                        className="table-scroll-top"
                        ref={tableScrollTopRef}
                        onScroll={(e) => tableScrollWrapperRef.current?.scrollTo({ left: e.currentTarget.scrollLeft })}>
                        <div className="table-scroll-top-content" ref={tableScrollTopContentRef} />
                    </div>
                )}

                <div
                    className="table-scroll"
                    ref={tableScrollWrapperRef}
                    onScroll={(e) => tableScrollTopRef.current?.scrollTo({ left: e.currentTarget.scrollLeft })}>
                    {children}
                </div>
            </div>
        </div>
    );
}
