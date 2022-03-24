import {createServer} from 'http';
import JsonAPI from './JsonAPI.mjs';
import {Tokens, generateToken, Users, User} from './Users.mjs'

const api = new JsonAPI({
  token: 'string'
}, '/users');

// read a resource
api.get({ resource: 'string' }, ({ token, resource }) => {
  if(token === 'EMPTY')
    return { error: 'empty token' };
  
  if(Tokens.valid(token) === false)
    return { error: 'invalid token' };
  
  const user = Users.get(token);
  
  switch(resource)
  {
    case 'clicks':
      return { clicks: user.clicks.toString() };
    case 'spaces':
      return { spaces: user.spaces.toString() };
    default:
      return { error: 'invalid resource name' };
  }
  
  // ...
  
  return { error: 'invalid request' };
});

// create a resource
api.post({ resource: 'string' }, ({ token, resource }) => {
  if(token === 'EMPTY' && resource === 'new token')
  {
    const token = generateToken();
    Tokens.add(token);
    Users.set(token, { clicks: 0, spaces: 0 });
    return { token };
  }
  
  if(Tokens.valid(token) === false)
    return { 'invalid token' };
  
  // ...
  
  return { error: 'invalid request' };
});
