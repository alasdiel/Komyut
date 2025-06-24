import { Command } from "commander";
import { showEditor } from "./editor";

import { editRouteFile, newRouteFile, compileAll } from "./functions";

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
        newRouteFile(opt.name, opt.id, opt.output);
    });

program
    .command('edit')
    .description("Edites an existing route")    
    .requiredOption("-i, --input <string>", "Input/Output file, only serves as input when output path is entered")
    .option("-o, --output <string>", "Output file")
    .action(async (opt) => {
        editRouteFile(opt.input, opt.output, 'output' in opt);
    });

program
    .command('compile')
    .description("Compiles routes from the input directory and creates a directory for output")
    .requiredOption("-i, --input <string>", "Directory with .route files")
    .requiredOption("-o, --output <string>", "Output directory to put build files")
    .option('--interval <meters>', "Truncation interval in meters", (val) => parseInt(val, 10), 300)
    .option('--mappingRadius <meters>', "T->F path mapping radius in meters", (val) => parseInt(val, 10), 1)
    .option('--transferRadius <meters>', "Maximum transfer walk distance", (val) => parseInt(val, 10), 500)
    .option('--spatialTolerance <meters>', "Spacial search tolerance", (val) => parseInt(val, 10), 700)
    .option('--continueReward <meters>', "RouteGraph edge reward for continuing (negative is rewarding)", (val) => parseInt(val, 10), -100)
    .option('--transferPenalty <meters>', "RouteGraph edge penalty for transferring", (val) => parseInt(val, 10), 10000)
    .action(async (opt) => {
        compileAll(opt.input, opt.output, opt.interval, opt.mappingRadius, opt.transferRadius, opt.spatialTolerance, opt.continueReward, opt.transferPenalty);
    });

//Start CLI program
// console.log('argv:', process.argv);
program.parse(process.argv);