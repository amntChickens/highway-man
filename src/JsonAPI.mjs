function tryParse(json_str)
{
  let obj;
  
  try 
  { 
    obj = JSON.parse(json_str); 
  }
  catch(err) 
  { 
    return undefined; 
  }
  
  return obj;
}

function validateJson(schema, obj)
{
  for(property in Object.keys(schema)) 
  {
    if(!obj.hasOwnProperty(property)) 
      return false;
    
    if( schema[property] === 'object' 
       && (typeof obj[property] !== 'object' || !validateJson(schema[property], obj[property])) )
      return false;
    
    if( schema[property] === 'array' && !Array.isArray(obj[property]) )
      return false;
  }
  
  return true;
}

function JsonAPI(schema, pathname)
{
  async function self(req, res)
  {
    let url = new URL(req.url);
    
    if(url.pathname !== pathname || self.handlers.hasOwnProperty(req.method.toLowercase()) == false)
    {
      res.writeHead(404, {'Content-Type':'application/json'});
      res.end('"404 Error"');
      return;
    }
    
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    const obj = tryParse(data);
    
    if(obj === undefined || validateJson(schema, obj) === false)
    {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end('"Internal Server Error"');
      return;
    }
    
    // ...
  }
  
  self.get = (schema, hndlr) => {
    self.handlers['get'] = { schema , hndlr };
    return self;
  };
  
  self.post = (schema, hndlr) => {
    self.handlers['post'] = { schema , hndlr };
    return self;
  };
  
  self.put = (schema, hndlr) => {
    self.handlers['put'] = { schema , hndlr };
    return self;
  };
  
  self.delete = (schema, hndlr) => {
    self.handlers['delete'] = { schema , hndlr };
    return self;
  };
  
  return self;
}
