import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { zipSync } from "fflate";
const root = new URL("..", import.meta.url).pathname;
const examples = [["server","src"]];
await rm(join(root,"dist"),{recursive:true,force:true}); await mkdir(join(root,"dist"),{recursive:true});
for (const [name,dir] of examples) { const files={}; for(const f of ["manifest.json","main.js","ui.js"]){try{files[f]=new Uint8Array(await readFile(join(root,dir,f)))}catch{}} await writeFile(join(root,"dist",`${name}.orb-plugin.zip`),zipSync(files,{level:9})); }
