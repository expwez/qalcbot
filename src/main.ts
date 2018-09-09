// Copyright 2018 Bogdan Danylchenko
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as tgbot from "node-telegram-bot-api"
import * as mathjs from "mathjs"
import * as log4js from "log4js"
import { Calculator, CalculatorAnswer, CalculateError } from "./calculator"
import { transliterate, getUserDisplayName } from "./helpers"

let debug = false;
if (process.argv.length > 2 && process.argv[2] == "--debug") {
    debug = true;
}

log4js.configure({
    appenders: { mylogger: { type: "file", filename: "log.txt" }, console: { type: 'console' } },
    categories: { default: { appenders: ["mylogger", "console"], level: debug ? "ALL" : "INFO" } }
});

const logger = log4js.getLogger("default");

const bot = new tgbot.default("000000000:AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
 
// Save examples article
const examples = {
    type: "article" as "article",
    id: "examples",
    title: "Examples",
    description: [
        "1.2 * (2 + 4.5) = 7.8",
        "12.7 cm to inch = 5 inch",
        "sin(45 deg) ^ 2 = 0.5"
    ].join("\n"),
    input_message_content: { message_text: "I wanted to show you some examples!" }
};

// Handle inline query
bot.on("inline_query", async (tgquery: tgbot.InlineQuery) => {
    logger.debug("Got message from " + getUserDisplayName(tgquery.from) + " with id `" + tgquery.id + "`: " + tgquery.query);

    let query = tgquery.query.trim().toLowerCase();

    if (query == "") {
        let results: tgbot.InlineQueryResultArticle[] = []
        results.push(examples as any);
        bot.answerInlineQuery(tgquery.id, results, {cache_time: 86400 });
        return;
    }

    query = transliterate(query)

    let answer: CalculatorAnswer

    try {
        answer = Calculator.calculate(query);
    } catch (e) {
        if (e instanceof CalculateError) {
            logger.debug("`" + tgquery.id + "` id got error while calculating: " + e.message);

            let results: tgbot.InlineQueryResultArticle[] = [
                examples,
                {
                    type: "article",
                    id: "1",
                    title: "Error",
                    description: e.message,
                    input_message_content: { message_text: "I've throwed an error!" }
                }
            ]

            bot.answerInlineQuery(tgquery.id, results, { cache_time: 86400 });
            return;
        } else throw e;
    }

    logger.debug("`" + tgquery.id + "` id got answer: " + answer.answer);

    let results: tgbot.InlineQueryResultArticle[] = [
        {
            type: "article",
            id: "1",
            title: "Answer",
            description: answer.answer,
            input_message_content: { message_text: answer.answer }
        },
        {
            type: "article",
            id: "2",
            title: "Full answer",
            description: answer.fullAnswer,
            input_message_content: { message_text: answer.fullAnswer }
        }
    ]

    bot.answerInlineQuery(query.id, results, { cache_time: 86400 });
})

// Handle messages in chats
bot.on("message", (msg: tgbot.Message) => {
    if (msg.text != undefined && msg.from != undefined) {
        if (msg.text == "/start" || msg.text == "/help") {
            bot.sendMessage(msg.from.id,
                [
                    "Hello! Here are some examples that you can send me and I will return you answer for your expressions:",
                    "`1.2 * (2 + 4.5) = 7.8`",
                    "`12.7 cm to inch = 5 inch`",
                    "`sin(45 deg) ^ 2 = 0.5`",
                    "`9 / 3 + 2i' = 3 + 2i`",
                    "`det([-1, 2; 3, 1]) = -7`"
                ].join("\n"), { parse_mode: "Markdown" })
            return;
        }

        let compiledText = transliterate(msg.text.trim());
        let answer: CalculatorAnswer
        try {
            answer = Calculator.calculate(compiledText);
        } catch (e) {
            if (e instanceof CalculateError) {
                bot.sendMessage(msg.from.id, e.message);
                return;
            } else throw e;
        }
        bot.sendMessage(msg.from.id, answer.answer);
    }
});

bot.startPolling();
