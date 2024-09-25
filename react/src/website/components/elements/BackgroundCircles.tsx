import React from 'react';

export default function BackgroundCircles({
    mainStyles = {},
    overlayStyles = {},
    circlesStyles = {},
}: {
    mainStyles?: object;
    overlayStyles?: object;
    circlesStyles?: object;
}) {
    return (
        <div className="block block-background-circles" style={mainStyles}>
            <div className="block-background-circles-overlay" style={overlayStyles} />
            <div className="block-background-circles-media" style={circlesStyles} />
        </div>
    );
}
