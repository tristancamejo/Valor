import { APIApplicationCommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { ChatInputCommand, ChatInputInteraction } from 'disploy';
import { fetchAccountData, fetchCompStats } from '../lib';

const a = '➤';

class CompetitiveStats implements ChatInputCommand {
	public name = 'competitive';
	public description = 'Get competitive stats for a player';

	public options: APIApplicationCommandOption[] = [
		{
			name: 'username',
			description: 'The username of the player',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'tag',
			description: 'The tag of the player',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	];

	private async fetchStats(username: string, tag: string) {
		const res = await fetchAccountData({
			name: username,
			tag,
		});

		const compStats = await fetchCompStats({
			region: res.region,
			name: res.name,
			tag: res.tag,
		});

		return { res, compStats };
	}

	public async run(interaction: ChatInputInteraction) {
		const username = interaction.options.getString('username');
		const tag = interaction.options.getString('tag');

		interaction.deferReply();

		const { res, compStats } = await this.fetchStats(username, tag);

		try {
			return void interaction.editReply({
				embeds: [
					{
						title: `${res.name}#${res.tag}`,
						description: [
							`${a} **Rank:** ${compStats.currentRating.rank.discordEmoji}`,
							`${a} **Peak Rank:** ${compStats.peakSeason.rank.discordEmoji}`,
							`${a} **Rank Rating:** ${compStats.currentRating.rank.elo} (${compStats.currentRating.rrChangeToLastGame})`,
						].join('\n'),
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

export default new CompetitiveStats();
