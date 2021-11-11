const Discord = require("discord.js");
const chalk = require('chalk')
const { table } = require('table');
const speedTest = require('speedtest-net');
const config = require("./config.json");
const fs = require('fs')

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
});

const prefix = "!";
const cli = {
  clear: {
    usage: '!clear <start-from> <end-to> <position>',
    description: 'Nó sẽ xóa tin nhắn của kênh mà người dùng đã gõ lệnh',
    about: ">> " + "<start-from> là 1 số nguyên.\n" + ">> " + "<end-to> là 1 số nguyên.\n" +
    ">> " + "<position> chỉ có \"top\" hoặc \"bottom\""
  },
  checkspeed: {
    usage: '!checkspeed',
    description: 'Dùng để kiểm tra tốc độ mạng của bạn đang dùng (sử dụng SpeedTest API)',
    about: ">> Dòng lệnh này không có tham số."
  },
  list: {
    usage: '!list',
    description: 'Dòng lệnh này liệt kê ra danh sách thành viên trong server này.',
    about: ">> Dòng lệnh này không có tham số."
  }
}

client.on("messageCreate", async function(message) { 
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase()

  /* check speed network */
  if(command === 'checkspeed') {
    message.reply("Đợi chút xíu đi có liền đây :)")
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    function niceBytes(x){
      let l = 0, n = parseInt(x, 10) || 0;
      while(n >= 1024 && ++l){
        n = n/1024;
      }
      return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }
    const info = await speedTest()
    const downloadBandwidth = niceBytes(info.download.bytes)
    const uploadBandwidth = niceBytes(info.upload.bytes)
    const fps = Math.round(info.ping.latency)
    message.reply(
      "Băng thông lúc tải về  là " + downloadBandwidth + "mb\n" +
      "Băng thông lúc tải lên là " + uploadBandwidth + "mb\n" +
      "fps là " + fps + "\n" +
      "Có nên chơi game fps hay không? " + (fps > 60 ? "không" : "có")
    )
  }
  
  /* clear messages */
  if(command === 'clear') {
    message.reply("bubu")
    const messages = await message.channel.messages.fetch({ limit: 100 })
    messages.toJSON().slice(messages.toJSON().length - 3, messages.toJSON().length)
    
    /* default will clear a message */
    const startFrom = args && args[0] && typeof parseInt(args[0]) == 'number' ? parseInt(args[0]) : 0
    const endTo = args && args[0] && args[1] && typeof parseInt(args[1]) == 'number' && parseInt(args[1]) > startFrom ? parseInt(args[1]) : 1
    const position = args && args[0] && args[1] && typeof args[2] == 'string' ? args[2] : 'top'

    if(position == 'top') {
      const rangedMessages = messages.toJSON().slice(messages.toJSON().length - endTo, messages.toJSON().length - startFrom)
      rangedMessages.forEach(rangedMessage => {
        rangedMessage.delete()
      })
    }

    if(position == 'bottom') {
      const rangedMessages = messages.toJSON().slice(startFrom, endTo)
      rangedMessages.forEach(rangedMessage => {
        rangedMessage.delete()
      })
    }
  }

  /* kick user */
  if(command === 'kick') {
    if(!args) {
      message.reply("Không cho nó về lâu đài tình ái à :v")
      return;
    }

    // console.log("you are " + message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))
    if(args && args[0] && typeof args[0] == 'string') {
      if(message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
        const members = await message.guild.members.list()
        console.log(members)
      }
    }

    return;
  }

  // /* ban a user */
  if(command === 'ban') {
    // message.guild.members.ban()
  }

  /* list a user list */
  if(command === 'list') {
    if(!message.member.user.bot) {
      message.reply(
        "=".repeat(30) + "\n" + 
        "Username:" + " ".repeat(6) + message.member.user.username + "\n" +
        "CreatedAt:" + " ".repeat(5) + message.member.user.createdAt + "\n" +
        "Url:" + " ".repeat(11) + message.member.user.displayAvatarURL() + "\n" +
        "Roles:" + " ".repeat(9) + message.member.roles.cache.toJSON() + "\n" +
        "=".repeat(30) + "\n"
      )
    }
  }

  /* show command table */
  if(command === 'help') {
    /* go detail to each command */
    if(args && args[0] === 'detail' && args[1] && typeof args[1] === 'string' && /(list|clear|checkspeed)/gm.test(args[1])) {
      message.reply(
        "\`\`\`ini\n" + 
        "Cách dùng: " + cli[args[1]].usage + "\n" +
        "Định nghĩa: " + cli[args[1]].description + '\n' +
        "Tham số: " + cli[args[1]].about + '\n' +
        "\`\`\`"
      )
      return;
    }
    const data = [
      ['Command', 'Description'],
      ['list', 'Dùng để liệt kê thành viên'],
      ['help', 'Mở bảng giúp đỡ'],
      ['clear', 'Xóa tin nhắn'],
      ['checkspeed', 'Kiểm tra tốc độ mạng']
    ];

    const embed = new Discord.MessageEmbed({
      color: 'DARK_GOLD',
      title: 'Bảng tổng hợp câu lệnh',
      description: "\`\`\`" + table(data) + "\`\`\`"
    })

    message.channel.send({ embeds: [embed], content: "\`\`\`fix\n" + ">>Xem chi tiết câu lệnh hơn thì gõ !help detail \<tên\-command\> để biết cách dùng\n" + "\`\`\`" + "\n" });
  }
});                                      

client.login(config.BOT_TOKEN);