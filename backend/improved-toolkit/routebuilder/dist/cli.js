"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const functions_1 = require("./functions");
const program = new commander_1.Command();
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
    .action((opt) => __awaiter(void 0, void 0, void 0, function* () {
    (0, functions_1.newRouteFile)(opt.name, opt.id, opt.output);
}));
program
    .command('edit')
    .description("Edites an existing route")
    .requiredOption("-i, --input <string>", "Input/Output file, only serves as input when output path is entered")
    .option("-o, --output <string>", "Output file")
    .action((opt) => __awaiter(void 0, void 0, void 0, function* () {
    (0, functions_1.editRouteFile)(opt.input, opt.output, 'output' in opt);
}));
program
    .command('compile')
    .description("Compiles routes from the input directory and creates a directory for output")
    .requiredOption("-i, --input <string>", "Directory with .route files")
    .requiredOption("-o, --output <string>", "Output directory to put build files")
    .option('--truncationInterval <meters>', "Truncation interval in meters", (val) => parseInt(val, 10), 300)
    .option('--mappingRadius <meters>', "T->F path mapping radius in meters", (val) => parseInt(val, 10), 1)
    .option('--transferRadius <meters>', "Maximum transfer walk distance", (val) => parseInt(val, 10), 500)
    .option('--spatialTolerance <meters>', "Spacial search tolerance", (val) => parseInt(val, 10), 700)
    .option('--continueReward <score>', "RouteGraph edge reward for continuing (negative is rewarding)", (val) => parseInt(val, 10), -100)
    .option('--transferPenalty <score>', "RouteGraph edge penalty for transferring", (val) => parseInt(val, 10), 10000)
    .action((opt) => __awaiter(void 0, void 0, void 0, function* () {
    (0, functions_1.compileAll)(opt.input, opt.output, opt.truncationInterval, opt.mappingRadius, opt.transferRadius, opt.spatialTolerance, opt.continueReward, opt.transferPenalty);
}));
//Start CLI program
// console.log('argv:', process.argv);
console.log(`[IMPORTANT!]: routebuilder requires a local OSRM instance running at port 5000!`);
program.parse(process.argv);
