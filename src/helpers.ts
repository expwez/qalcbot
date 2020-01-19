import * as fs from "fs";
import * as tgbot from "node-telegram-bot-api";

export function transliterate(text: string): string {
    const rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g);
    const eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x i".split(/ +/g);

    for (let x = 0; x < rus.length; x++) {
        text = text.split(rus[x]).join(eng[x]);
        text = text.split(rus[x].toUpperCase()).join(eng[x].toUpperCase());
    }
    return text;
}

export function getUserDisplayName(user: tgbot.User) {
    return user.first_name
        + (user.last_name ? " " + user.last_name : "")
        + (user.username ? " (" + user.username + ") " : "");
}

export function readJsonSync(path: string) {
    return JSON.parse(fs.readFileSync(path, { encoding: "utf8" }))
}
