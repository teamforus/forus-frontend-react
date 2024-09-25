import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import useAppConfigs from '../../../hooks/useAppConfigs';
import BookDemoForm from './elements/BookDemoForm';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function BookDemo() {
    const setTitle = useSetTitle();
    const appConfigs = useAppConfigs();
    const setMetaDescription = useSetMetaDescription();

    useEffect(() => {
        setTitle('Klaar om uw impact te vergroten? | Vraag een demo aan');
        setMetaDescription(
            [
                'Wij zullen zo spoedig mogelijk contact met u opnemen om een ',
                'afspraak in te plannen voor een demonstratiesessie.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    useEffect(() => {
        if (!appConfigs) {
            return;
        }
    }, [appConfigs]);

    return (
        <Fragment>
            <BackgroundCircles mainStyles={{ height: '750px' }} />
            <div className="wrapper hide-sm">
                <div className="block block-contact-form block-contact-form-book-demo">
                    <BookDemoForm />
                </div>
            </div>

            <div className="show-sm block block-contact-form block-contact-form-book-demo">
                <BookDemoForm />
            </div>
        </Fragment>
    );
}
