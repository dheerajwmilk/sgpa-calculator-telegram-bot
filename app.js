import { Telegraf, Markup, session } from "telegraf";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from 'url';
import { parsePDFtoJSON } from "./pdfparser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { configDotenv } from "dotenv";
configDotenv({ path: "./env" });

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ defaultSession: () => ({ state: null, semester: null }) }));

bot.telegram.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'sgpa', description: 'Calculate SGPA' },
    { command: 'about', description: 'About this bot' }
]);

bot.command('start', async (ctx) => {
    await ctx.reply(
        'Welcome to the SGPA Calculator Bot! use /sgpa to get started',
    );
    // console.log(ctx);
});
bot.command('about', async (ctx) => {
    await ctx.reply(
        "Welcome to the SGPA Calculator Bot!\n\nThis handy tool makes it effortless to compute your RTU BTech SGPA—no more wrestling with clunky online calculators or manually inputting data.\n\nNote: We're still in the development phase, and testing has been limited so far. If you spot any issues or inaccuracies, please DM me at @haaleluah for quick fixes. Your feedback helps us improve!\n\nReady to calculate? Just share your semester details using the /sgpa command. 🚀"
    );
    // console.log(ctx);
});

bot.command('sgpa', async (ctx) => {
    ctx.reply("Please send your result PDF. The semester will be detected automatically.");
    ctx.session.state = 'waiting_pdf';
});

bot.on('document', async (ctx) => {
    const file = ctx.message.document;

    // Only accept PDFs
    if (file.mime_type !== 'application/pdf') {
        return ctx.reply('Please upload a PDF file only.');
    }
    if (ctx.session.state === 'waiting_pdf') {
        try {
            // Get file link from Telegram
            const fileLink = await ctx.telegram.getFileLink(file.file_id);
            
            // Download the file
            const response = await axios.get(fileLink.href, { responseType: 'stream' });
            
            const filePath = path.join(__dirname, 'Uploads', file.file_name);
            const writer = fs.createWriteStream(filePath);
            
            response.data.pipe(writer);
            
            writer.on('finish', async () => {
                ctx.reply('PDF received successfully!');
                
                // Call parsePDFtoJSON with null semester (auto-detect)
                const result = await parsePDFtoJSON(filePath, null);
                ctx.reply(result);
                ctx.session.state = null; // Reset state after processing
            });
            
            writer.on('error', () => {
                ctx.reply('Failed to save PDF.');
                ctx.session.state = null;
            });
        } catch (err) {
            console.error(err);
            ctx.reply('Failed to process PDF.');
            ctx.session.state = null;
        }
    } else {
        ctx.reply('❗ Please use /sgpa before uploading your PDF.');
    }
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));