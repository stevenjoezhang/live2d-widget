type Time = {
    hour: string;
    text: string;
}[];
declare function showMessage(text: string | string[], timeout: number, priority: number): void;
declare function welcomeMessage(time: Time): string;
export { showMessage, welcomeMessage, Time };
