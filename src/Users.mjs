import Store from 'Store.mjs';

const db = new Store('db.json', {
  autoWrite: (1000 * 60), // set the database to write to the file every minute
});

const Tokens = {
  tokens: Object.keys(db.cache),
  valid: function(token) {
    return Object.keys(db.cache).indexOf(token) !== -1;
  },
  add: function(token) {
    if(Tokens.valid(token) === true) //make sure the token doesn't already exist
      throw "Invalid Token";
    Tokens.tokens.push(token);
  },
};

function generateToken()
{
  const token = Buffer.from(
    Date.now().toString() + Math.floor(Math.random()*(1 << 20)).toString()
  ).toString('base64');
  return token;
}

const Users = {
  get: (token) => db.cache[token],
  set: (token, obj) => Object.assign(db.cache[token], obj),
};


export { Users, Tokens, generateToken };
