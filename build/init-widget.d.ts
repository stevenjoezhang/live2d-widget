declare function initWidget(config: string | Config, apiPath?: string): void;
declare function loadExternalResource(url: string, type: string): Promise<string>;
export { initWidget, loadExternalResource };
