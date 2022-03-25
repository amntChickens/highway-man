import fs from 'fs/promises';

async function Store(filename, options)
{
  this.cache = JSON.parse(
    await fs.readFile(filename).catch((error) => throw error)
  );
  
  if(options.hasOwnProperty('autoWrite') && options.autoWrite != false)
  {
    this.autoWriter = setInterval(() => {
      fs.writeFile(filename, JSON.stringify(this.cache))
        .catch((error) => throw error);
    }, options.autoWrite === true ? (1000*60) : (options.autoWrite));
  }
  
  this.write = async () => {
    await fs.writeFile(filename, JSON.stringify(this.cache))
            .catch((error) => throw error);
  };
  
  this.writeSync = () => {
    try {
      fs.writeFileSync(filename, JSON.stringify(this.cache));
    } catch(error) {
      throw error;
    }
  };
}


export default Store;
