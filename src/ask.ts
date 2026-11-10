/**
 * @file Contains the "ask" tool, which answers questions about the current page.
 * @module ask
 */

import { showMessage } from './message.js';
import logger from './logger.js';
import type { Tips } from './widget.js';

interface AskConfig {
  /**
   * Site key of the answering service. The tool is only available when it is set.
   * @type {string}
   */
  key: string;
  /**
   * Endpoint that answers the questions.
   * @type {string | undefined}
   */
  endpoint?: string;
  /**
   * Instructions for the answer, e.g. the persona of the waifu.
   * @type {string | undefined}
   */
  system?: string;
}

const ENDPOINT = 'https://onetagai.com/v1/ask';
const SYSTEM =
  'You are a mascot living on a web page. Answer the visitor in at most two short sentences, in the language of the question, using the page content. If the page does not answer the question, say so.';
// Stays above the idle and hover messages, so the dialog is not replaced while in use.
const PRIORITY = 10;

function escapeHTML(text: string): string {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}

/**
 * Ask a question about the current page.
 * @param {AskConfig} config - Configuration of the ask tool.
 * @param {string} question - Question of the visitor.
 * @returns {Promise<string>} The answer.
 */
async function askPage(config: AskConfig, question: string): Promise<string> {
  const page: HTMLElement =
    document.querySelector('main, article, [role="main"]') || document.body;
  const response = await fetch(config.endpoint || ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: config.key,
      prompt: question,
      system: config.system || SYSTEM,
      input: [
        {
          type: 'text',
          text: `${document.title}\n\n${page.innerText}`.slice(0, 20000)
        }
      ],
      max_tokens: 200,
      via: 'live2d-widget'
    })
  });
  const result = await response.json();
  if (!response.ok || typeof result.text !== 'string') {
    throw new Error(result.error?.message || `HTTP ${response.status}`);
  }
  return result.text.trim();
}

/**
 * Show an input in the dialog and answer the question typed into it.
 * @param {AskConfig} config - Configuration of the ask tool.
 * @param {Tips | null} tips - Result configuration.
 */
function showAsk(config: AskConfig, tips: Tips | null) {
  const message = tips?.message;
  showMessage('<input id="waifu-ask" type="text" maxlength="200">', 60000, PRIORITY);
  const input = document.getElementById('waifu-ask') as HTMLInputElement | null;
  // A message with a higher priority is on display.
  if (!input) return;
  input.placeholder = message?.ask ?? 'Ask about this page…';
  input.focus();
  input.addEventListener('keydown', async (event) => {
    const question = input.value.trim();
    if (event.key !== 'Enter' || event.isComposing || !question) return;
    showMessage(message?.askWaiting ?? 'Let me think…', 60000, PRIORITY);
    try {
      const answer = await askPage(config, question);
      showMessage(escapeHTML(answer), Math.min(30000, 6000 + answer.length * 100), PRIORITY);
    } catch (error) {
      logger.warn('Failed to answer the question.', error);
      showMessage(message?.askFail ?? 'Sorry, I cannot answer right now.', 4000, PRIORITY);
    }
  });
}

export { showAsk, askPage, AskConfig };
