declare function randomSelection(obj: string[] | string): string;
declare function randomOtherOption(total: number, excludeIndex: number): number;
declare function loadExternalResource(url: string, type: string): Promise<string>;
export { randomSelection, loadExternalResource, randomOtherOption };
