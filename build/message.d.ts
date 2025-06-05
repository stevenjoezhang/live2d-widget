type Time = {
    hour: string;
    text: string;
}[];
declare function showMessage(text: string | string[], timeout: number, priority: number, override?: boolean): void;
declare function welcomeMessage(time: Time, welcomeTemplate: string, referrerTemplate: string): string;
declare function i18n(template: string, ...args: string[]): string;
export { showMessage, welcomeMessage, i18n, Time };
