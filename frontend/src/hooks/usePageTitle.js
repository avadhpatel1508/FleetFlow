import { useEffect } from 'react';

const usePageTitle = (pageTitle) => {
    useEffect(() => {
        document.title = pageTitle ? `FleetFlow · ${pageTitle}` : 'FleetFlow';
    }, [pageTitle]);
};

export default usePageTitle;
