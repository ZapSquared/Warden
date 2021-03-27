const {SlashCommand, CommandOptionType} = require("slash-create");

let action = function (details) {
    const settings = require("../../main.js").settings;
    const managers = settings.get("managers");
    const build = require("../../main.js").build;
    const modules = require("../../main.js").modules;
    const bot = require("../../main.js").bot;
    const msToTime = require("../../main.js").msToTime;
    const msToTimeString = require("../../main.js").msToTimeString;
    const roundTo = require("../../main.js").roundTo;
    let type = "";
    if ((details["slash"] && details["body"]["stats"]) || (!details["slash"] && details["body"] === "stats")) {
        if (details["slash"] && !managers.includes(details["context"]["user"].id)) {
            details["context"].send({
                embeds: [
                    {
                        description: "You need to be a **Manager** to use that.",
                        color: 0x2518a0
                    }
                ]
            });
        }
        else if (!details["slash"] && !managers.includes(details["message"].author.id)) {
            return "manager";
        }
        else {
            type = "stats";
        }
    }
    if (!details["slash"] && !["stats", ""].includes(details["body"])) {
        return "usage";
    }
    let userTotal = 0;
    bot.guilds.map(g => g.memberCount).forEach(a => userTotal += a);
    let channelTotal = 0;
    bot.guilds.map(g => g.channels.size).forEach(a => channelTotal += a);
    let uptime = msToTime(process.uptime() * 1000);
    let uptimeString = msToTimeString(uptime);
    let modulesLoaded = Object.keys(modules).length;
    let actionsLoaded = 0;
    Object.keys(modules).forEach(module => {
        actionsLoaded += Object.keys(modules[module]).length;
    });
    let embed = {
        title: "Warden",
        description: `A moderation and utility bot, part of the ZapSquared Network.\nSource code available [here](https://github.com/zapteryx/Warden).\nRunning build [\`${build.slice(0, 7)}\`](https://github.com/zapteryx/Warden/commit/${build}).`,
        color: 0x2518a0,
        fields: type === "stats" ? [
            {
                name: "Bot Statistics",
                value: `**Servers**: ${bot.guilds.size}\n**Users**: ${userTotal} (${bot.users.size} cached)\n**Channels**: ${channelTotal}`
            },
            {
                name: "Technical Statistics",
                value: `**RAM Usage**: ${roundTo(process.memoryUsage().heapUsed / 1024 / 1024, 2).toString()} MB\n**Uptime**: ${uptimeString}\n**Modules Loaded**: ${modulesLoaded} (${actionsLoaded} actions)`
            },
            {
                name: "Version",
                value: `**Warden**: \`${build}\`\n**Eris**: \`${require("eris").VERSION}\`\n**NodeJS**: \`${process.env.NODE_VERSION}\``
            }
        ] : [],
        thumbnail: {
            url: bot.user.avatarURL
        }
    };
    if (details["slash"]) {
        details["context"].send({
            embeds: [embed]
        });
    }
    else {
        details["message"].channel.createMessage({
            messageReferenceID: details["message"].id,
            embed: embed
        });
    }
    return true;
};

module.exports.slash = class InfoCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "info",
            description: "Display information about Warden.",
            options: [
                {
                    name: "stats",
                    description: "Display additional statistics about Warden.",
                    required: false,
                    type: CommandOptionType.BOOLEAN
                }
            ]
        });
    }
    async run(ctx) {
        let details = {
            prefix: "/",
            cmd: "info",
            body: ctx.options,
            guild: !!ctx.guildID,
            context: ctx,
            slash: true
        };
        action(details);
    }
}
module.exports.commands = ["info"];
module.exports.usage = "%cmd% [stats]";
module.exports.description = "Display information about Warden.";
module.exports.action = action;