import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap as GoogleMapComponent, InfoWindow, Marker } from '@react-google-maps/api';
import { AppConfigProp } from '../../../services/ConfigService';
import useIsMobile from '../../../../webshop/hooks/useIsMobile';

export function GoogleMap({
    appConfigs,
    mapPointers = [],
    mapGestureHandling,
    mapGestureHandlingMobile,
    markerTemplate,
    openFirstPointer = false,
    centerType = null,
    zoomLevel = 12,
    fullscreenPosition = null,
    mapTypeControlOptions = { mapTypeIds: ['roadmap', 'map_style'] },
}: {
    appConfigs: AppConfigProp;
    centerType?: 'avg';
    zoomLevel?: number;
    fullscreenPosition?: google.maps.ControlPosition | null;
    mapPointers: Array<{ lat: string; lon: string }>;
    mapGestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    mapGestureHandlingMobile?: 'cooperative' | 'greedy' | 'none' | 'auto';
    markerTemplate?: (item: { lat: string; lon: string }) => React.ReactElement | Array<ReactElement>;
    openFirstPointer?: boolean;
    mapTypeControlOptions?: google.maps.MapTypeControlOptions;
}) {
    const [selectedMarker, setSelectedMarker] = React.useState(null);
    const [markers, setMarkers] = useState([]);
    const isMobile = useIsMobile(1000);

    const avg = useCallback((values: Array<number>) => {
        return values.reduce((avg, value) => value + avg, 0) / values.length;
    }, []);

    const center = useMemo(() => {
        if (centerType == 'avg' && markers.length > 0) {
            return {
                lat: avg(markers.map((pointer) => parseFloat(pointer.lat))),
                lng: avg(markers.map((pointer) => parseFloat(pointer.lon))),
            };
        }

        const center = {
            lat: markers.length > 0 ? parseFloat(markers[0].lat) : appConfigs.map.lat,
            lng: markers.length > 0 ? parseFloat(markers[0].lon) : appConfigs.map.lon,
        };

        return center.lat && center.lng ? center : null;
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, centerType, markers]);

    const [mapStyles] = useState([
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ]);

    const [gestureHandling] = useState(
        window.innerWidth >= 768 ? mapGestureHandling : mapGestureHandlingMobile || mapGestureHandling,
    );

    useEffect(() => {
        setMarkers(
            mapPointers
                .filter((pointer) => !isNaN(parseFloat(pointer.lon)) && !isNaN(parseFloat(pointer.lat)))
                .map((pointer) => ({
                    ...pointer,
                    lat: typeof pointer.lat === 'string' ? parseFloat(pointer.lat) : pointer.lat,
                    lng: typeof pointer.lon === 'string' ? parseFloat(pointer.lon) : pointer.lon,
                })),
        );
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, mapPointers]);

    useEffect(() => {
        if (openFirstPointer && markers.length === 1) {
            setSelectedMarker(markers[0]);
        }
    }, [markers, openFirstPointer]);

    return (
        <div className={'map'}>
            <GoogleMapComponent
                mapContainerClassName={'map-canvas'}
                center={center}
                zoom={zoomLevel}
                options={{
                    styles: mapStyles,
                    scrollwheel: true,
                    disableDefaultUI: false,
                    gestureHandling: gestureHandling || undefined,
                    scaleControl: true,
                    mapTypeControl: !isMobile,
                    fullscreenControl: true,
                    mapTypeControlOptions: mapTypeControlOptions,
                    fullscreenControlOptions: {
                        position: isMobile
                            ? window.google.maps.ControlPosition.LEFT_BOTTOM
                            : fullscreenPosition || window.google.maps.ControlPosition.LEFT_BOTTOM,
                    },
                }}>
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker}
                        onClick={() => (markerTemplate ? setSelectedMarker(marker) : null)}
                    />
                ))}
                {markerTemplate && selectedMarker && (
                    <InfoWindow position={selectedMarker} onCloseClick={() => setSelectedMarker(null)}>
                        {markerTemplate(selectedMarker)}
                    </InfoWindow>
                )}
            </GoogleMapComponent>
        </div>
    );
}
