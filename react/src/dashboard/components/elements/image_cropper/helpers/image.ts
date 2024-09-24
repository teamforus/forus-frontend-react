export const createObjectURL = (file: File | Blob) => {
    return (window.URL || window.webkitURL).createObjectURL(file);
};

function fitImage(contains: boolean) {
    return (
        parentWidth: number,
        parentHeight: number,
        childWidth: number,
        childHeight: number,
        scale = 1,
        offsetX = 0.5,
        offsetY = 0.5,
    ) => {
        const childRatio = childWidth / childHeight;
        const parentRatio = parentWidth / parentHeight;
        let width = parentWidth * scale;
        let height = parentHeight * scale;

        if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
            height = width / childRatio;
        } else {
            width = height * childRatio;
        }

        return {
            width,
            height,
            offsetX: (parentWidth - width) * offsetX,
            offsetY: (parentHeight - height) * offsetY,
        };
    };
}

function contain(offsetX: number, offsetY: number, width: number, height: number) {
    return fitImage(true)(offsetX, offsetY, width, height);
}

// todo: tmp
export function cover(offsetX: number, offsetY: number, width: number, height: number) {
    return fitImage(false)(offsetX, offsetY, width, height);
}

export function resizeCanvas(
    source: HTMLCanvasElement,
    width: number,
    height: number,
    resize: 'contain' | 'cover' = 'cover',
    fillStyle = '#ffffff',
) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    if (fillStyle) {
        context.fillStyle = fillStyle;
        context.fillRect(0, 0, width, height);
    }

    const position =
        resize == 'cover'
            ? cover(canvas.width, canvas.height, source.width, source.height)
            : contain(canvas.width, canvas.height, source.width, source.height);

    context.imageSmoothingQuality = 'high';
    context.imageSmoothingEnabled = true;
    context.drawImage(source, position.offsetX, position.offsetY, position.width, position.height);

    return canvas;
}
