import { useState, useEffect } from 'react';

export default function useIsMobile(mobileWidth = 1000) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= mobileWidth);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= mobileWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [mobileWidth]);

    return isMobile;
}
