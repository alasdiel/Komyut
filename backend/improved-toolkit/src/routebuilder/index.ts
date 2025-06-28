import { Command } from "commander";
import { showEditor } from "./editor";

import { editRouteFile, newRouteFile, compileAll } from "./functions";

const program = new Command();

//Route builder info
program
    .name("routebuilder")
    .description("CLI to create routes")
    .version('1.0.0');

//Create new file
program
    .command('new')
    .description("Creates a new route")
    .requiredOption("-n, --name <string>", "Route name")
    .requiredOption("-i, --id <string>", "Route ID")
    .requiredOption("-o, --output <string>", "Output path")
    .action(async (opt) => {
        newRouteFile(opt.name, opt.id, opt.output);
    });

//Edit existing file
program
    .command('edit')
    .description("Edites an existing route")    
    .requiredOption("-i, --input <string>", "Input/Output file, only serves as input when output path is entered")
    .option("-o, --output <string>", "Output file")
    .action(async (opt) => {
        editRouteFile(opt.input, opt.output, 'output' in opt);
    });

//Compile a route pack
program
    .command('compile')
    .description("Compiles a Route Pack from routes in the input directory and creates a directory for output")
    .requiredOption("-i, --input <string>", "Directory with .route files")
    .requiredOption("-o, --output <string>", "Output directory to put build files")
    .option('--TRUNCATION_INTERVAL <meters>', "Truncation interval in meters", (val) => parseInt(val, 10), 300)
    .option('--MAPPING_RADIUS <meters>', "T->F path mapping radius in meters", (val) => parseInt(val, 10), 1)
    .option('--TRANSFER_RADIUS <meters>', "Maximum transfer walk distance", (val) => parseInt(val, 10), 500)
    .option('--SPATIAL_TOLERANCE <meters>', "Spacial search tolerance", (val) => parseInt(val, 10), 700)
    .option('--CONTINUE_REWARD <score>', "RouteGraph edge reward for continuing (negative is rewarding)", (val) => parseInt(val, 10), -100)
    .option('--TRANSFER_PENALTY <score>', "RouteGraph edge penalty for transferring", (val) => parseInt(val, 10), 10000)
    .action(async (opt) => {
        compileAll(opt.input, opt.output, {
            MAPPING_RADIUS: opt.MAPPING_RADIUS,
            TRANSFER_RADIUS: opt.TRANSFER_RADIUS,
            SPATIAL_TOLERANCE: opt.SPATIAL_TOLERANCE,
            CONTINUE_REWARD: opt.CONTINUE_REWARD,
            TRANSFER_PENALTY: opt.TRANSFER_PENALTY,
            TRUNCATION_INTERVAL: opt.TRUNCATION_INTERVAL
        });
    });

//Start CLI program
// console.log('argv:', process.argv);
console.log(`[IMPORTANT!]: routebuilder requires a local OSRM instance running at port 5000!`);
program.parse(process.argv);