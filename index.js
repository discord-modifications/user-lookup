const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { getUser } = getModule(['getUser'], false);

module.exports = class UserLookup extends Plugin {
   startPlugin() {
      powercord.api.commands.registerCommand({
         command: 'whois',
         aliases: ['id', 'lookup'],
         label: 'User ID Info',
         usage: '{c} <id>',
         description: 'Lookup user info from a user id',
         executor: this.getInfo
      })
   }

   async getInfo(id) {
      try {
         let user = await getUser(String(id));
         let tag = `${user.username}#${user.discriminator}`;
         let avatar;

         if (!user.avatar) {
            avatar = `https://canary.discord.com${user.avatarURL}`;
         } else {
            avatar = `https://cdn.discordapp.com/avatars/${String(user.id)}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=4096`
         }

         let unix = (id / 4194304) + 1420070400000;
         let time = new Date(unix);
         let date = `${time.getMonth() + 1}/${time.getDate()}/${time.getFullYear()} `;
         let difference = UserLookup.differentiate(Date.now(), unix)

         return {
            result: {
               type: 'rich',
               title: `UserID Lookup for ${tag}`,
               color: 0xff0000,
               fields: [
                  { name: 'ID', value: String(id) },
                  { name: 'Tag', value: `<@${id}> ` },
                  { name: 'Username', value: tag },
                  { name: 'Bot', value: user.bot ? 'Yes' : 'No' },
                  { name: 'Avatar', value: `[URL](${avatar})` },
                  { name: 'Created', value: `${date} (${difference})` }
               ]
            },
            embed: true
         }
      } catch (err) {
         console.log(err)
         return {
            result: 'Invalid ID.'
         }
      }
   }

   pluginWillUnload() {
      powercord.api.commands.unregisterCommand('whois');
   }

   static differentiate(current, previous) {
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;
      var msPerYear = msPerDay * 365;
      var elapsed = current - previous;
      if (elapsed < msPerMinute) {
         return `${Math.round(elapsed / 1000)} seconds ago`
      } else if (elapsed < msPerHour) {
         return `${Math.round(elapsed / msPerMinute)} minutes ago`
      } else if (elapsed < msPerDay) {
         return `${Math.round(elapsed / msPerHour)} hours ago`
      } else if (elapsed < msPerMonth) {
         return `${Math.round(elapsed / msPerDay)} days ago`
      } else if (elapsed < msPerYear) {
         return `${Math.round(elapsed / msPerMonth)} months ago`
      } else {
         return `${Math.round(elapsed / msPerYear)} years ago`
      }
   }
}
