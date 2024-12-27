import randomSelection from "./utils.js";
var messageTimer = null;
function showMessage(text, timeout, priority) {
    if (!text || (sessionStorage.getItem("waifu-text") && Number(sessionStorage.getItem("waifu-text")) > priority))
        return;
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    text = randomSelection(text);
    sessionStorage.setItem("waifu-text", String(priority));
    var tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    messageTimer = setTimeout(function () {
        sessionStorage.removeItem("waifu-text");
        tips.classList.remove("waifu-tips-active");
    }, timeout);
}
export default showMessage;
