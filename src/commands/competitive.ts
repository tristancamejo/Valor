import { Command, type ChatInputInteraction } from "@disploy/framework";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { fetchAccountData, fetchCompStats } from "../lib";

const a = "➤";

export default class CompetitiveStats extends Command {
  public constructor() {
    super({
      name: "competitive",
      description: "Get competitive stats for a player",
      options: [
        {
          name: "username",
          description: "The username of the player",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "tag",
          description: "The tag of the player",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }

  override async slashRun(interaction: ChatInputInteraction) {
    const username = interaction.options.getString("username");
    const tag = interaction.options.getString("tag");

    interaction.deferReply();

    try {
      const res = await fetchAccountData({
        name: username,
        tag,
      });

      const compStats = await fetchCompStats({
        region: res.region,
        name: res.name,
        tag: res.tag,
      });

      return void interaction.editReply({
        embeds: [
          {
            title: `${res.name}#${res.tag}`,
            description: [
              `${a} **Rank:** ${compStats.currentRating.rank.discordEmoji}`,
              `${a} **Peak Rank:** ${compStats.peakSeason.rank.discordEmoji}`,
              `${a} **Rank Rating:** ${compStats.currentRating.rank.elo} (${compStats.currentRating.rrChangeToLastGame})`,
            ].join("\n"),
          },
        ],
      });
    } catch (e) {
      console.error(e);
      return void interaction.editReply({
        content: `No account found for ${username}#${tag}`,
      });
    }
  }
}
