import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';
import { engine } from 'express-handlebars';
import session from 'express-session';
import { User, Team, Player } from './db.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Home Route
app.get('/', (req, res) => {
  //res.send('Welcome to the AKtion NBA Team Management System');
  res.render('home');
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', engine({
  defaultLayout: false
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ 
  secret: 'your-secret-key', 
  resave: true, 
  saveUninitialized: true 
}));

function isAuthenticated(req, res, next){
  if(req.session.isValid){
    next();
  } else {
    res.render({ message: 'Please log in or create an account to save your team.' });
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/', async (req,res) =>{
  const records = await User.find({username: req.body.username});
});

// Registration Route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (validPassword) {
        req.session.userId = user._id;
        req.session.isValid = true;  
        res.redirect('/dashboard');
      } else {
        res.render('login', { message: 'Invalid password' });
      }
    } else {
      res.render('login', { message: 'User Not Found' });
    }
  } catch (error) {
    console.error("Login Error: ", error);
    res.render('login', { message: 'Login Error' });
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Dashboard Route
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard');
});

// Create Team Route
app.get('/createTeam', isAuthenticated, async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('createTeam'); 
});

app.post('/createTeam', async (req, res) => {
  try {
    const team = new Team({
      teamName: req.body.teamName,
      owner: req.session.userId
    });
    await team.save();
    req.session.currentTeamId = team._id;
    res.redirect('/createPlayers');
  } catch (error) {
    console.error("Error creating team:", error);
    res.redirect('/createTeam');
  }
});

// Delete Team Route
app.post('/deleteTeam/:id', isAuthenticated, async (req, res) => {
  try {
    const teamId = req.params.id;
    await Team.findByIdAndDelete(teamId);
    res.redirect('/myTeams');
  } catch (error) {
    console.error("Error deleting team: ", error);
    res.status(500).send("Error deleting team");
  }
});

// Delete Player Route
app.post('/deletePlayer/:playerId', isAuthenticated, async (req, res) => {
  try {
    const { playerId } = req.params;

    const teamWithPlayer = await Team.findOne({ players: playerId });
    if (!teamWithPlayer) {
      return res.status(404).send('Team not found');
    }

    teamWithPlayer.players = teamWithPlayer.players.filter(p => p.toString() !== playerId);
    await teamWithPlayer.save();

    await Player.findByIdAndDelete(playerId);

    res.redirect(`/teamDetails/${teamWithPlayer._id}`);
  } catch (error) {
    console.error("Error deleting player: ", error);
    res.status(500).send("Error deleting player");
  }
});

// Create Players Route
app.get('/createPlayers', isAuthenticated, async (req, res) => {
  const teamId = req.query.teamId || req.session.currentTeamId;

  if (!teamId) {
    console.error("Team ID cannot be found.");
    return res.redirect('/dashboard');
  }

  try {
    const team = await Team.findById(teamId).lean();
    if (!team) {
      console.error("Team not found for ID:", teamId);
      return res.redirect('/dashboard');
    }
    res.render('createPlayers', { 
      teamId: team._id, 
      heightOptions: generateHeightOptions() 
    });
  } catch (error) {
    console.error("Error accessing Create Players page:", error);
    res.status(500).send("Error accessing Create Players page");
  }
});

app.post('/createPlayers', async (req, res) => {
  try {
    const player = new Player({
      firstName: req.body.playerFirstName,
      lastName: req.body.playerLastName,
      position: req.body.playerPosition,
      number: req.body.playerNumber,
      height: req.body.playerHeight,
      age: req.body.playerAge,
    });
    await player.save();

    const teamId = req.body.teamId;
    const team = await Team.findById(teamId).populate('players');
    if (team.players.length < 5) {
      res.redirect('/createPlayers?teamId=' + teamId);
    } else {
      res.redirect('/teamDetails/' + teamId);
    }
  } catch (error) {
    console.error("Error adding player: ", error);
    res.redirect('/createPlayers');
  }
});

function generateHeightOptions() {
  const heights = [];
  heights.push(" ");
  for (let inches = 68; inches <= 96; inches++) {
      const feet = Math.floor(inches / 12);
      const remainingInches = inches % 12;
      heights.push(`${feet}'${remainingInches}"`);
  }
  return heights;
}

// Add Player POST route
/*app.post('/addPlayer', isAuthenticated, async (req, res) => {
  const { teamId, ...playerData } = req.body;
  try {
    const team = await Team.findById(teamId).populate('players');
    if (!team) {
      return res.status(404).send('Team not found');
    }

    if (team.players.length >= 15) {
      return res.redirect(`/teamDetails/${teamId}?message=Team is full`);
    }

    const newPlayer = new Player(playerData);
    const savedPlayer = await newPlayer.save();
    team.players.push(savedPlayer._id);
    await team.save();

    res.redirect(`/teamDetails/${teamId}`);
  } catch (error) {
    console.error("Error adding player: ", error);
    res.status(500).send("Error adding player");
  }
});*/

app.post('/addPlayer', isAuthenticated, async (req, res) => {
  const { teamId, playerFirstName, playerLastName, playerPosition, playerNumber, playerHeight, playerAge } = req.body;
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).send('Team not found');
    }

    if (team.players.length < 5) {
      res.redirect('/createPlayers?teamId=' + teamId);
    } else {
      res.redirect('/teamDetails/' + teamId);
    }
    if (team.players.length >= 15) {
      return res.redirect(`/teamDetails/${teamId}?error=The roster is full, you cannot add players to this team`);
    }
    const newPlayer = new Player({
      firstName: playerFirstName,
      lastName: playerLastName,
      position: playerPosition,
      number: playerNumber,
      height: playerHeight,
      age: playerAge,
      team: teamId
    });
    
    const savedPlayer = await newPlayer.save();
    team.players.push(savedPlayer._id);
    await team.save();
    
    res.redirect('/teamDetails/' + teamId);
  } catch (error) {
    console.error("Error adding player: ", error);
    res.status(500).send("Error adding player");
  }
});

// Next Player Route
app.get('/nextPlayer', isAuthenticated, async (req, res) => {
  try {
    const teamId = req.session.currentTeamId;
    
    const team = await Team.findById(teamId).populate('players').lean(); 
    if (!team) {
      console.error("Team not found for ID: ", teamId);
      res.redirect('/createPlayers');
    }
    const minPlayersNeeded = Math.max(5 - team.players.length, 0);
    const maxPlayersAllowed = 15 - team.players.length;

    res.render('nextPlayer', { 
      players: team.players, 
      currentYear: new Date().getFullYear(),
      minPlayersNeeded,
      maxPlayersAllowed,
      teamId: teamId 
    });
  } catch (error) {
    console.error("Error fetching team with players: ", error);
    res.redirect('/createPlayers');
  }
});

app.post('/nextPlayer', async (req, res) => {
  try {
    const player = new Player({
      firstName: req.body.playerFirstName,
      lastName: req.body.playerLastName,
      position: req.body.playerPosition,
      number: req.body.playerNumber,
      height: req.body.playerHeight, 
      age: req.body.playerAge,
    });
    await player.save();
    res.redirect('/createPlayers'); 
  } catch (error) {
    console.error("Error adding player: ", error);
    res.redirect('/createPlayers');
  }
});

// My Teams Route
app.get('/myTeams', isAuthenticated, async (req, res) => {
  try {
    let teams = await Team.find({ owner: req.session.userId }).lean();
    res.render('myTeams', { teams });
  } catch (error) {
    console.error("Error fetching teams: ", error);
    res.status(500).send("Error retrieving teams");
  }
});

app.post('/myTeams', async (req, res) => {
  try {
    const newTeam = new Team({
      teamName: req.body.teamName,
      owner: req.session.userId
    });
    const savedTeam = await newTeam.save();

    res.redirect(`/createPlayers?teamId=${savedTeam._id}`);
  } catch (error) {
    console.error("Error creating team: ", error);
    res.status(500).send("Error creating team");
  }
});

// Team Details Route
app.get('/teamDetails/:id', isAuthenticated, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players').lean();
    if (!team) {
      return res.status(404).send('Team not found');
    }

    if (team.players.length < 5) {
      return res.redirect(`/createPlayers?teamId=${team._id}`);
    }

    const canAddMorePlayers = team.players.length < 15;
    res.render('teamDetails', { team, canAddMorePlayers });
  } catch (error) {
    console.error("Error fetching team details: ", error);
    res.status(500).send("Error retrieving team details");
  }
});

app.post('/teamDetails/:id', isAuthenticated, async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).send('Team not found');
    }

    team.teamName = req.body.teamName || team.teamName;
    await team.save();

    res.redirect(`/teamDetails/${team._id}`);
  } catch (error) {
    console.error("Error updating team: ", error);
    res.status(500).send("Error updating team details");
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
