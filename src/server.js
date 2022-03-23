import {createServer} from 'http';
import JsonAPI from './JsonAPI.mjs';
import {tokens, generateToken, Users, User} from './Users.mjs'

const api = new JsonAPI({
  token: 'string'
});

api.get({ resource: 'string' }, ({ token, resource }) => {
  if(token === 'EMPTY' && resource === 'new token')
    return { token: generateToken() };
  
  if(tokens.indexOf(token) === -1)
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
});
