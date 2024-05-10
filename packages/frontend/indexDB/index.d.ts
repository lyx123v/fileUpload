interface Result {
    name: string;
    content: string;
}
export declare const init: () => Promise<unknown>;
export declare const get: (name: string) => Promise<Result>;
export declare const add: (name: string, content: any) => Promise<Result>;
export declare const update: (name: string, content: any) => Promise<Result>;
export declare const remove: (name: string) => Promise<Result>;
declare const _default: {
    init: () => Promise<unknown>;
    get: (name: string) => Promise<Result>;
    add: (name: string, content: any) => Promise<Result>;
    update: (name: string, content: any) => Promise<Result>;
    remove: (name: string) => Promise<Result>;
};
export default _default;
