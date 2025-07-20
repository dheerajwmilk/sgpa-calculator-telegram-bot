import { Telegraf, Markup, session } from "telegraf";
import fs from "fs"
import path from "path";
import axios from "axios";
import { fileURLToPath } from 'url';
import { parsePDFtoJSON } from "./pdfparser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { configDotenv } from "dotenv";
configDotenv({ path: "./env" })


const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(session())


bot.telegram.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Get help' },
    { command: 'sgpa', description: 'sgpa' },
    { command: 'about', description: 'About this bot' }
]);

bot.command('start', async (ctx) => {
    await ctx.reply(
        'hhhh',
        Markup.keyboard([
            ['📄 Info', '📊 Status'],
            ['🔙 Back']
        ])
            .resize()
            .oneTime(false)

    );
    console.log(ctx)
});



// bot.hears('📊 Status', async (ctx) => {
//     return  await ctx.replyWithDocument('https://github.com/dheerajeas/file-ki/raw/main/Course%20details.pdf')

//     }
// )


// bot.hears('📊 Status', async (ctx) => {
//         const buffer = fs.readFileSync('24EGECS015.pdf');
//         return ctx.replyWithDocument({ source: buffer, filename: 'le maderchod.pdf' });

// })

const pendingUsers = new Set();

bot.command('sgpa', async (ctx) => {
    ctx.reply("Please send your result PDF.");
    pendingUsers.add(ctx.chat.id); // Mark this user as waiting to upload
});

bot.on('document', async (ctx) => {
  const file = ctx.message.document;

  // Only accept PDFs
  if (file.mime_type !== 'application/pdf') {
    return ctx.reply('Please upload a PDF file only.');
  }
  if (pendingUsers.has(ctx.chat.id)) {
        // return ctx.reply('❗ Please use /sgpa before uploading your PDF.');
        try {
          // Get file link from Telegram
          const fileLink = await ctx.telegram.getFileLink(file.file_id);
          
          // Download the file
          const response = await axios.get(fileLink.href, { responseType: 'stream' });
          
          const filePath = path.join(__dirname, 'uploads', file.file_name);
          const writer = fs.createWriteStream(filePath);
          
          response.data.pipe(writer);
          
          writer.on('finish', async () => {
            ctx.reply('PDF received successfully!');
            
            // ✅ Call your analyze function here
            const result = await parsePDFtoJSON(filePath);
            ctx.reply(result);
          
          });
          
          writer.on('error', () => {
            ctx.reply('Failed to save PDF.');
          });
        } catch (err) {
          console.error(err);
          ctx.reply('Failed to process PDF.');
        }
      }
});



bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));