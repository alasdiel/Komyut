import { Command } from "commander";
import { showMap } from "./map-handler";
import { loadRoutePack } from "./route-loader";

const program = new Command();

//Route calc info
program
    .name("routecalc-gui")
    .description("Web-based GUI app to test route calculations")
    .version('1.0.0')
    .argument('<routepackFile>', 'Path to routepack.json')
    .action(async (routePackFile) => {
        //Load routepack from file
        //Create a map instance
        //handle api request to calculate route, args: start, end, response: path

        const routePackData = loadRoutePack(routePackFile);
        if(!routePackData) {
          console.error(`Error loading routepack data!, exiting...`);
          return;
        }

        showMap(routePackData);
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}