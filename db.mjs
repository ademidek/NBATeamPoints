import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true } 
});

const User = mongoose.model('User', userSchema);

// Player Schema
const playerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  number: Number,
  position: String, // One of PG, SG, SF, PF, C
  height: String,
  age: Number,
});

const Player = mongoose.model('Player', playerSchema);

// Team Schema
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  maxPlayers: { type: Number, default: 15 }
});

const Team = mongoose.model('Team', teamSchema);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

export { User, Player, Team };
