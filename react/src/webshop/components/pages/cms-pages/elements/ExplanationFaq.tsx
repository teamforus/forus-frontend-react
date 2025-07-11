import React, { useCallback, useEffect, useState } from 'react';
import implementationPage from '../../../../props/models/ImplementationPage';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import Fund from '../../../../props/models/Fund';
import { useFundService } from '../../../../services/FundService';
import { uniqueId } from 'lodash';
import useEnvData from '../../../../hooks/useEnvData';
import FaqBlock from '../../../elements/faq-block/FaqBlock';

export default function ExplanationFaq({ page }: { page: implementationPage }) {
    const envData = useEnvData();
    const translate = useTranslate();

    const [defaultFaq, setDefaultFaq] = useState<Array<{ id?: number; title?: string; description?: string }>>([]);

    const fundService = useFundService();

    const [defaultQuestionKeys] = useState([
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
    ]);

    const transformDefaultQuestion = useCallback(
        (index: number, fund: string, start_date: string) => {
            const key = defaultQuestionKeys[index];
            const titleKey = `home.faq.${envData.client_key}.faq_${key}`;
            const contentKey = `home.faq.${envData.client_key}.${key}`;

            return {
                id: parseInt(uniqueId()),
                title: translate(titleKey, { fund }, `home.faq.faq_${key}`),
                description: translate(contentKey, { fund, start_date }, `home.faq.${key}`),
            };
        },
        [defaultQuestionKeys, envData.client_key, translate],
    );

    const makeDefaultFAQ = useCallback(
        (funds: Array<Fund>) => {
            const list = [...Array(14).keys()].map((i) => {
                return transformDefaultQuestion(i, funds[0].name, funds[0].start_date_locale);
            });

            if (['winterswijk', 'oostgelre', 'berkelland'].includes(envData.client_key)) {
                list.push(transformDefaultQuestion(14, funds[0].name, funds[0].start_date_locale));
            }

            setDefaultFaq(list);
        },
        [envData?.client_key, transformDefaultQuestion],
    );

    useEffect(() => {
        fundService.list().then((res) => makeDefaultFAQ(res.data.data));
    }, [fundService, makeDefaultFAQ]);

    if (page.description_html && page.description_position === 'replace' && page.faq.length < 1) {
        return null;
    }

    if (page.faq?.length > 0) {
        return <FaqBlock title={translate('home.faq.title', { client_key: '' })} items={page.faq} />;
    }

    return <FaqBlock title={translate('home.faq.title', { client_key: '' })} items={defaultFaq} />;
}
