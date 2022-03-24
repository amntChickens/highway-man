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

function JsonAPI(_schema, _pathname)
{
  const schema = _schema ?? {};
  const pathname = _pathname ?? '/';
  
  async function self(req, res)
  {
    let url = new URL(req.url);
    
    if(url.pathname !== pathname || self.handlers.hasOwnProperty(req.method.toLowercase()) == false)
    {
      res.writeHead(404, {'Content-Type':'application/json'});
      res.end('"not found"');
      return;
    }
    
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    const obj = tryParse(data);
    
    if(obj === undefined)
    {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end('"could not parse json string"');
      return;
    }
    
    if(validateJson(schema, obj) === false)
    {
      res.writeHead(422, {'Content-Type':'application/json'});
      res.end(`"could not validate object. Make sure the given object contains these properties: ${JSON.stringify(schema)}"`);
    }
    
    const hndlr = self.handlers[req.method.toLowercase()];
    
    if(hndlr.schema !== null && validateJson(hndlr.schema, obj))
    {
      res.writeHead(422, {'Content-Type':'application/json'});
      res.end(`"could not validate object. Make sure the given object contains these properties: ${JSON.stringify(hndlr.schema)}"`);
      return;
    }
    
    let res_obj;
    try {
      res_obj = hndlr.hndlr(obj);
    } catch(err) {
      res.writeHead(500, {});
      res.end();
      return;
    }
    
    if(res_obj === undefined)
    {
      res.writeHead(500, {});
      res.end();
      return;
    }
    
    try {
      res_obj = JSON.stringify(res_obj);
    } catch(error) {
      res.writeHead(500, {});
      res.end();
      return;f
    }
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(res_obj);
    return;
  }
  
  self.get = (schema, hndlr) => {
    schema = schema ?? null;
    self.handlers['get'] = { schema , hndlr };
    return self;
  };
  
  self.post = (schema, hndlr) => {
    schema = schema ?? null;
    self.handlers['post'] = { schema , hndlr };
    return self;
  };
  
  self.put = (schema, hndlr) => {
    schema = schema ?? null;
    self.handlers['put'] = { schema , hndlr };
    return self;
  };
  
  self.delete = (schema, hndlr) => {
    schema = schema ?? null;
    self.handlers['delete'] = { schema , hndlr };
    return self;
  };
  
  return self;
}


export default JsonAPI;
export { validateJson };
