﻿using DEA.Common;
using DEA.Common.Data;
using DEA.Common.Extensions.DiscordExtensions;
using DEA.Database.Repositories;
using DEA.Services.Static;
using Discord;
using Discord.Commands;
using Discord.WebSocket;
using System.Reflection;
using System.Threading.Tasks;

namespace DEA.Services.Handlers
{
    /// <summary>
    /// Handles all commands.
    /// </summary>
    public class CommandHandler
    {
        private readonly IDependencyMap _map;
        private readonly DiscordSocketClient _client;
        private readonly CommandService _commandService;
        private readonly Statistics _statistics;
        private readonly ErrorHandler _errorHandler;
        private readonly UserRepository _userRepo;

        public CommandHandler(CommandService commandService, IDependencyMap map)
        {
            _map = map;
            _commandService = commandService;
            _statistics = _map.Get<Statistics>();
            _errorHandler = _map.Get<ErrorHandler>();
            _userRepo = _map.Get<UserRepository>();
            _client = _map.Get<DiscordSocketClient>();
            _client.MessageReceived += HandleCommandAsync;
        }

        public async Task InitializeAsync()
        {
            await _commandService.AddModulesAsync(Assembly.GetEntryAssembly());
        }

        public Task HandleCommandAsync(SocketMessage s)
        {
            return Task.Run(async () =>
            {
                _statistics.MessagesRecieved++;
                var msg = s as SocketUserMessage;
                if (msg == null)
                {
                    return;
                }

                var context = new DEAContext(_client, msg, _map);
                if (context.Guild == null)
                {
                    return;
                }

                if (context.User.IsBot)
                {
                    return;
                }

                await context.InitializeAsync();

                int argPos = 0;

                if (msg.HasStringPrefix(context.DbGuild.Prefix, ref argPos) ||
                msg.HasMentionPrefix(_client.CurrentUser, ref argPos))
                {
                    var perms = (context.Guild.CurrentUser as IGuildUser).GetPermissions(context.Channel as SocketTextChannel);

                    if (!perms.SendMessages || !perms.EmbedLinks)
                    {
                        try
                        {
                            var channel = await context.User.CreateDMChannelAsync();

                            await channel.SendAsync($"DEA cannot execute any commands without the permission to send embedded messages.");
                        }
                        catch { }
                        return;
                    }

                    Logger.Log(LogSeverity.Debug, $"Guild: {context.Guild}, User: {context.User}", msg.Content);

                    var result = await _commandService.ExecuteAsync(context, argPos, _map);
                    if (!result.IsSuccess)
                    {
                        await _errorHandler.HandleCommandFailureAsync(context, result, argPos);
                    }
                    else
                    {
                        _statistics.CommandsRun++;
                    }
                }
                else if (msg.Content.Length >= Config.MIN_CHAR_LENGTH)
                {
                    await _userRepo.ApplyCash(context.GUser, context.DbUser, context.DbGuild);
                }
            });
        }
    }
}
