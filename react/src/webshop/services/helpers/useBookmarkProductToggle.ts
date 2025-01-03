import Product from '../../../dashboard/props/models/Product';
import { useCallback } from 'react';
import usePushRaw from '../../../dashboard/hooks/usePushRaw';
import usePushSuccess from '../../../dashboard/hooks/usePushSuccess';
import { useNavigateState } from '../../modules/state_router/Router';
import { useProductService } from '../ProductService';
import usePopNotification from '../../../dashboard/hooks/usePopNotification';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function useBookmarkProductToggle() {
    const pushRaw = usePushRaw();
    const pushSuccess = usePushSuccess();
    const translate = useTranslate();
    const navigateState = useNavigateState();
    const popNotification = usePopNotification();
    const productService = useProductService();

    const showBookmarkPush = useCallback(
        (product: Product) => {
            const media = product?.photo || null;
            const productImgSrc =
                media?.sizes?.small || media?.sizes?.thumbnail || './assets/img/placeholders/product-small.png';

            productService.list({ bookmarked: 1, per_page: 1 }).then((res) => {
                const id = pushRaw({
                    icon: null,
                    title: product.name,
                    imageSrc: productImgSrc,
                    message: translate('product_bookmark_push.list_message', { total: res.data.meta.total }),
                    group: 'bookmarks',
                    button: {
                        icon: 'cards-heart-outline',
                        text: translate('product_bookmark_push.go_to_bookmarks'),
                        onClick: () => {
                            navigateState('bookmarked-products');
                            popNotification(id);
                        },
                    },
                });
            });
        },
        [productService, pushRaw, navigateState, popNotification, translate],
    );

    return useCallback(
        async (product: Product) => {
            product.bookmarked = !product.bookmarked;

            if (product.bookmarked) {
                return await productService.bookmark(product.id).then((res) => {
                    showBookmarkPush(product);
                    return res.data.data.bookmarked;
                });
            }

            return await productService.removeBookmark(product.id).then((res) => {
                pushSuccess(translate('product_bookmark_push.removed', { name: product.name }));
                return res.data.data.bookmarked;
            });
        },
        [productService, pushSuccess, showBookmarkPush, translate],
    );
}
