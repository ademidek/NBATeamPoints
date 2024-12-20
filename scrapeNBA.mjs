import axios from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Team } from './db.mjs';

dotenv.config();

const scrapeNBAData = async () => {
    const url = "https://www.nba.com/"; 
    let teamNames = [];

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        $('.team-name').each((i, elem) => {
            const teamName = $(elem).text().trim();
            if (teamName) {
                teamNames.push(teamName);
            }
        });

        return teamNames;
    } catch (error) {
        console.error('Error scraping data:', error);
        return [];
    }
};

const insertTeamsIntoDB = async (teamNames) => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    for (const name of teamNames) {
        const existingTeam = await Team.findOne({ teamName: name });

        if (!existingTeam) {
            const team = new Team({ teamName: name });
            await team.save();
        }
    }
    mongoose.disconnect();
};

const main = async () => {
    const teamNames = await scrapeNBAData();
    if (teamNames && teamNames.length > 0) {
        await insertTeamsIntoDB(teamNames);
    }
};

main();
