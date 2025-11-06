// A. นำเข้าไลบรารีและโหลดค่าจาก .env
require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');

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