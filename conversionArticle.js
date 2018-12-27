const converter = require("./odtConverter").ODTConverter;
const config = require('./config.json')

let pages = [];
for(let id in config.sources)
    pages.push(id);

let promise = Promise.resolve();

//pages = ["resolutionActions"];

for(let i=0; i<pages.length; i++)
{
    let id = pages[i];
    promise = promise.then(()=>{
        console.log(`Conversion de ${config.sources[id]} (${id}) : ${i+1}/${pages.length}`);
        return converter.convertODT(config.sources[id], `./output/${id}.html`);
    });
}
