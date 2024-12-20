import mongoose from 'mongoose';
import { Team } from './db.mjs';
import connectDB from './database.mjs';

const teamData = [
    { teamName: 'Atlanta' },
    { teamName: 'Boston' },
    { teamName: 'Brooklyn' },
    { teamName: 'Charlotte' },
    { teamName: 'Chicago' },
    { teamName: 'Cleveland' },
    { teamName: 'Dallas' },
    { teamName: 'Denver' },
    { teamName: 'Detroit' },
    { teamName: 'Golden State' },
    { teamName: 'Houston' },
    { teamName: 'Indiana' },
    { teamName: 'Clippers' },
    { teamName: 'Lakers' },
    { teamName: 'Memphis' },
    { teamName: 'Miami' },
    { teamName: 'Milwaukee' },
    { teamName: 'Minnesota' },
    { teamName: 'New Orleans' },
    { teamName: 'New York' },
    { teamName: 'Oklahoma City' },
    { teamName: 'Orlando' },
    { teamName: 'Philadelphia' },
    { teamName: 'Phoenix' },
    { teamName: 'Portland' },
    { teamName: 'Sacramento' },
    { teamName: 'San Antonio' },
    { teamName: 'Toronto' },
    { teamName: 'Utah' },
    { teamName: 'Washington' },
];

const insertTeams = async () => {
    await connectDB();

    try {
        for (const team of teamData) {
            const existingTeam = await Team.findOne({ teamName: team.teamName });
            if (!existingTeam) {
                const newTeam = new Team(team);
                await newTeam.save();
            }
        }
        console.log('Teams have been inserted');
    } catch (error) {
        console.error('Error inserting teams:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        } catch (disconnectError) {
            console.error('Error disconnecting from MongoDB:', disconnectError);
        }
    }
};

insertTeams();
