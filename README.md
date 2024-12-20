The content below is an example project proposal / requirements document. Replace the text below the lines marked "__TODO__" with details specific to your project. Remove the "TODO" lines.

# NBA Team Creator

## Overview

In the NBA there are many metrics used to measure player performance. The most basic statistics are things such as points, assists, rebounds, steals, and blocks amongst a plethora of others. Without a doubt there are players who stand out on every team, and these players produce the highest volume of stats. However, it is unlikely that these 'star players' will all play on the same team.

This app gives the user the abiility to create their own roster of NBA players on a singular team. By doing this, the player can use their imagination to dream up the best team possible.

## Data Model

The application will store Players, Teams and Player Data

* teams can have multiple players (via references)
* each player can have multiple parameters (by embedding)

An Example Player:

```javascript
{
  team: "Dallas Mavericks"
  player: "Luka Doncic",
  position: "PG"
  age: 28,
  height: "6'8"
  number: 77,
}
```

An Example List with Embedded Items:

```javascript
{
  team: "Dallas Mavericks",
  items: [
    { name: "Luka Doncic", number: 77, position: "PG", height: "6'8"},
    { name: "Kyrie Irving", number: 11, position: "SG", height: "6'3"},
  ],
  createdAt: // timestamp
}
```

## [Link to Commented First Draft Schema](db.mjs) 

## Wireframes

(__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.)

/list/create - page for generating a player comparison query

![list create](documentation/compare.png)

/list - page for showing all team

![list](documentation/teams.png)

/list - page for showing all players on a team's roster

![list](documentation/roster.png)

## Site map

Site map:

Home Page
- Teams
  - Player Rosters
    - Individual Player Stats
- Player Lookup
- Comparison Tool
- Filter
  - Fiter (by statistic)
  - Filter (by game)
  - Filter (by season)
- Sort
  - Sort (by statistic)

## User Stories or Use Cases

(__TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://en.wikipedia.org/wiki/Use_case))

1. as a user, I can register on the site
2. as a user, I can log in to the site
3. as a user, I can view all teams I have created
4. as a user, I can view all the players in a team I have created
5. as a user, I can create a new player team comparison list
6. as a user, I can customize a team's name and image
7. as a user, I can add players to an existing team
8. as a user, I can remove players from an existing team
9. as a user, I can sort players by position in ascending and descending order
10. as a user, I can view player's stats over a season or a single game

## Research Topics

(__TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed)

* (3 points) Unit testing with Jest
    * I'm going to be using the Jest framework for unit testing
* (5 points) tailwind.css
    * using tailwind.css as the css framework; it's a challenging library to learn, so I've assigned it 5 points

8 points total out of 8 required points 

## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)
