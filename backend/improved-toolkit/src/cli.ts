import { Command } from "commander";
import { showEditor } from "./editor";
import { saveRouteFile, readRouteFile } from "./functions";


const program = new Command();

//Route builder info
program
    .name("routebuilder")
    .description("CLI to create routes")
    .version('0.9.0');

//Create new file
program
    .command('new')
    .description("Creates a new route")
    .requiredOption("-n, --name <string>", "Route name")
    .requiredOption("-i, --id <string>", "Route ID")
    .requiredOption("-o, --output <string>", "Output path")
    .action(async (opt) => {

        //Show editor
        //Once editor closes, get waypoints and fullPath        
        const editorData = await showEditor(opt.name, opt.id);
        
        //Save to routefile
        saveRouteFile(opt.name, opt.id, editorData, opt.output);
    });

program
    .command('edit')
    .description("Edites an existing route")    
    .requiredOption("-i, --input <string>", "Input file")    
    .action(async (opt) => {
        //Load existing file
        const routeObject = await readRouteFile(opt.input);

        //Show editor, push existing routeData
        //Once editor closes, get waypoints and fullPath        
        const editorData = await showEditor(routeObject.routeName, routeObject.routeId, routeObject.waypoints);
        
        //Save to routefile
        saveRouteFile(routeObject.routeName, routeObject.routeId, editorData, opt.input);
    });

//Start CLI program
<<<<<<< HEAD
=======
// console.log('argv:', process.argv);
console.log(`[IMPORTANT!]: routebuilder requires a local OSRM instance running at port 5000!`);
>>>>>>> 414749f (refactor: moved path calculation to CLI instead of editor)
program.parse(process.argv);