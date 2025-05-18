interface Tools {
    [key: string]: {
        icon: string;
        callback: () => void;
    };
}
declare const tools: Tools;
export default tools;
export { Tools };
