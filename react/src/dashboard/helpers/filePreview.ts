const PDF_EXTENSIONS = ['pdf'];
const IMAGE_EXTENSIONS = ['png', 'jpeg', 'jpg'];
const PREVIEW_EXTENSIONS = [...IMAGE_EXTENSIONS, ...PDF_EXTENSIONS];

const normalizeFileExtension = (ext?: string) => (ext || '').toLowerCase();

const isPreviewableExtension = (ext?: string) => PREVIEW_EXTENSIONS.includes(normalizeFileExtension(ext));

const isImageExtension = (ext?: string) => IMAGE_EXTENSIONS.includes(normalizeFileExtension(ext));

const isPdfExtension = (ext?: string) => PDF_EXTENSIONS.includes(normalizeFileExtension(ext));

export {
    IMAGE_EXTENSIONS,
    PREVIEW_EXTENSIONS,
    isImageExtension,
    isPdfExtension,
    isPreviewableExtension,
    normalizeFileExtension,
};
