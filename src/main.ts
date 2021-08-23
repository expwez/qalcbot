import * as log4js from "log4js";
import * as tgbot from "node-telegram-bot-api";
import {Calculator} from "./calculator/calculator";
import {CalculatorAnswer} from "./calculator/calculator-answer";
import {CalculateError} from "./calculator/calculator-error";
import {getUserDisplayName, readJsonSync, transliterate} from "./helpers";

interface IConfig {
    token: string;
}

const config = readJsonSync("./config.json") as IConfig;

let debug = false;

if (process.argv.length > 2 && process.argv[2] === "--debug") {
    debug = true;
}

log4js.configure({
    appenders: {mylogger: {type: "file", filename: "log.txt"}, console: {type: "console"}},
    categories: {default: {appenders: ["mylogger", "console"], level: debug ? "ALL" : "INFO"}},
});

const logger = log4js.getLogger("default");

const bot = new tgbot.default(config.token);
const calculator = new Calculator();

// Save examples article
const examples = {
    description: [
        "1.2 * (2 + 4.5) = 7.8",
        "12.7 cm to inch = 5 inch",
        "sin(45 deg) ^ 2 = 0.5",
    ].join("\n"),
    id: "examples",
    input_message_content: {message_text: "I wanted to show you some examples!"},
    title: "Examples",
    type: "article" as "article",
};

// Handle inline query
bot.on("inline_query", async (tgquery: tgbot.InlineQuery) => {
    logger.debug("Got message from "
        + getUserDisplayName(tgquery.from)
        + " with id `"
        + tgquery.id + "`: " + tgquery.query);

    let query = tgquery.query.trim().toLowerCase();

    if (query == null) {
        await bot.answerInlineQuery(tgquery.id, [examples], {cache_time: 86400});
        return;
    }

    query = transliterate(query);

    let answer: CalculatorAnswer;

    try {
        answer = calculator.calculate(query);
    } catch (e) {
        if (e instanceof CalculateError) {
            logger.debug("`" + tgquery.id + "` id got error while calculating: " + e.message);

            await bot.answerInlineQuery(tgquery.id, [
                examples,
                {
                    description: e.message,
                    id: "1",
                    input_message_content: {message_text: "I've throwed an error!"},
                    title: "Error",
                    type: "article",
                },
            ], {cache_time: 86400});
            return;
        }

        throw e;
    }

    logger.debug("`" + tgquery.id + "` id got answer: " + answer.answer);

    const results: tgbot.InlineQueryResultArticle[] = [
        {
            description: answer.answer,
            id: "1",
            input_message_content: {message_text: answer.answer},
            title: "Answer",
            type: "article",
        },
        {
            description: answer.fullAnswer,
            id: "2",
            input_message_content: {message_text: answer.fullAnswer},
            title: "Full answer",
            type: "article",
        },
    ];

    await bot.answerInlineQuery(tgquery.id, results, {cache_time: 86400});
});

// Handle messages in chats
bot.on("message", (msg: tgbot.Message) => {
    if (msg.text != null && msg.from != null) {
        if (msg.text === "/start" || msg.text === "/help") {
            bot.sendMessage(msg.from.id,
                [
                    "Hello! Here are some examples that you can send me and I will return you answer for your expressions:",
                    "`1.2 * (2 + 4.5) = 7.8`",
                    "`12.7 cm to inch = 5 inch`",
                    "`sin(45 deg) ^ 2 = 0.5`",
                    "`9 / 3 + 2i' = 3 + 2i`",
                    "`det([-1, 2; 3, 1]) = -7`",
                ].join("\n"), {parse_mode: "Markdown"});
            return;
        }

        const compiledText = transliterate(msg.text.trim());

        let answer: CalculatorAnswer;
        try {
            answer = calculator.calculate(compiledText);
        } catch (e) {
            if (e instanceof CalculateError) {
                logger.debug("`" + msg.chat + "` id got error while calculating: " + e.message);

                bot.sendMessage(msg.from.id, e.message);
                return;
            }

            throw e;
        }
        bot.sendMessage(msg.from.id, answer.answer);
    }
});

bot.startPolling();
