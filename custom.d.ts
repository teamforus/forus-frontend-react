declare module '*.css' {}
declare module '*.scss' {}

declare module '*.svg' {
    const content: any;
    export default content;
}

declare module '@joplin/turndown-plugin-gfm' {
    export const gfm: any;
}

declare const env_data: any;
