require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');


console.log(process.env.API_TOKEN);
const app = express();

app.use(morgan('dev'));

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  
  console.log('validate bearer token middleware');
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request'});
  }
  // move to the next middleware
  next();
});

function handleGetTypes(req, res) {
  res.json(validTypes);
};

app.get("/types", handleGetTypes);

function handleGetPokemon(req, res) {
  const { type, name } = req.query;
  let results = POKEDEX.pokemon;

  if (!name && !type) {
    return res.status(200).json(results);
  }

  if (name && type) {
    return res.status(400).send('Query must be one of type or name');
  }

  if (!name) {
    let lowerCaseArr = validTypes.map(type => type.toLowerCase()).includes(type.toLowerCase());
    if (!lowerCaseArr) {
      return res.status(400).send(`Type must be one of: ${validTypes.join(', ')}`);
    }
    results = results.filter(poke => poke.type.map(el => el.toLowerCase()).includes(type.toLowerCase()));
  }

  if(!type) {
    const lowerCaseName = name.toLowerCase();
    if (!results.filter(poke => poke.name.toLowerCase().includes(lowerCaseName))) {
      return res.status(400).send('Pokemon name must exist');
    };
    results = results.filter(poke => poke.name.toLowerCase().includes(name.toLowerCase()));
  }


  return res.status(200).json(results);
};

app.get('/pokemon', handleGetPokemon);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});