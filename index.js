// A. นำเข้าไลบรารีและโหลดค่าจาก .env
require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http'); // ⬅️ เพิ่มบรรทัดนี้
const PORT = process.env.PORT || 3000; // ⬅️ เพิ่มบรรทัดนี้

// B. กำหนด Intents (สำคัญมากสำหรับฟังก์ชัน Role อัตโนมัติ)
// ต้องมี GuildMembers Intent และ MessageContent Intent
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,           
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.MessageContent,   
        GatewayIntentBits.GuildMembers,     // Intent สำหรับติดตามสมาชิกใหม่
    ] 
});

// C. Event: เมื่อบอทออนไลน์
client.on('ready', () => {
    console.log(`บอท ${client.user.tag} ออนไลน์แล้ว!`);
});

// ----------------------------------------------------------------------
// D. ฟังก์ชันหลัก: การให้ Role อัตโนมัติ (Auto-Role)
// ----------------------------------------------------------------------

client.on('guildMemberAdd', async member => {
    console.log(`สมาชิกใหม่เข้าร่วม: ${member.user.tag}`);

    // *** เปลี่ยนเป็นชื่อ Role ที่คุณสร้างไว้ในเซิร์ฟเวอร์ ***
    const roleName = 'ลมปาก'; 
    
    // ค้นหา Role ในเซิร์ฟเวอร์ (Role ของบอทต้องอยู่สูงกว่า Role นี้)
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (role) {
        try {
            await member.roles.add(role);
            console.log(`มอบ Role "${roleName}" ให้กับ ${member.user.tag} เรียบร้อย`);
        } catch (error) {
            console.error(`ไม่สามารถมอบ Role ให้ ${member.user.tag} ได้:`, error);
        }
    } else {
        console.log(`ไม่พบ Role ที่ชื่อ "${roleName}"`);
        // อาจส่งข้อความแจ้งเตือนให้ผู้ดูแลระบบ (Admin) ก็ได้
    }
});


// ----------------------------------------------------------------------
// E. ฟังก์ชันพื้นฐาน: การตอบกลับคำสั่ง (Message Command)
// ----------------------------------------------------------------------

client.on('messageCreate', msg => {
    if (msg.author.bot) return;

    const prefix = '!';
    if (!msg.content.startsWith(prefix)) return; 

    const command = msg.content.slice(prefix.length).trim().toLowerCase();

    if (command === 'ping') {
        msg.reply('Pong!'); 
    }
    // ... สามารถเพิ่มคำสั่งอื่น ๆ ที่นี่ ...
});


// F. เข้าสู่ระบบบอท
client.login(process.env.DISCORD_TOKEN);
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Discord Bot is running and online!');
}).listen(PORT, () => {
    console.log(`Web Server is running on port ${PORT}`);
});
// ในไฟล์ index.js (เพิ่ม Event นี้ต่อจาก guildMemberAdd)

// ⚠️ เปลี่ยน ID นี้เป็น ID ของช่องแชท Log ที่ Admin ดูเท่านั้น
const logChannelId = '1436188031366201494'; 

client.on('guildMemberRemove', member => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return; // ไม่ทำอะไรถ้าหาช่องแชทไม่เจอ

    const embed = {
        color: 0xff0000, // สีแดง
        title: '🔴 สมาชิกออกจากเซิร์ฟเวอร์',
        fields: [
            {
                name: '👤 ผู้ใช้',
                value: `${member.user.tag} (${member.id})`,
            },
            {
                name: '⏰ ระยะเวลาที่อยู่',
                // คำนวณความแตกต่างระหว่างเวลาที่เข้าร่วมถึงเวลาออก
                value: `เข้าร่วมเมื่อ: ${new Date(member.joinedTimestamp).toLocaleDateString()}`,
            },
        ],
        timestamp: new Date(),
    };

    logChannel.send({ embeds: [embed] });
});

// ในไฟล์ index.js

client.on('messageDelete', message => {
    // ⚠️ ตรวจสอบว่าข้อความไม่ได้ถูกลบโดยบอทเอง
    if (message.author.bot) return; 
    
    // ⚠️ เปลี่ยน ID นี้เป็น ID ของช่องแชท Log เดียวกันกับข้างบน
    const logChannelId = '1436188466525507715'; 
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = {
        color: 0xf0e68c, // สีกากี
        title: '🗑️ ข้อความถูกลบ',
        description: `ข้อความของผู้ใช้ **${message.author.tag}** ถูกลบใน ${message.channel.name}`,
        fields: [
            {
                name: 'เนื้อหาข้อความ',
                value: message.content ? message.content.substring(0, 1024) : 'ไม่พบเนื้อหา (อาจเป็นข้อความ Embed หรือรูปภาพ)',
            },
        ],
        timestamp: new Date(),
    };

    logChannel.send({ embeds: [embed] });
});