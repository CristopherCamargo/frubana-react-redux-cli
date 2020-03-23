import arg from "arg";
import { createTemplate } from "./main";

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--atom": Boolean,
      "--molecule": Boolean,
      "--organism": Boolean,
      "--page": Boolean,
      "--template": Boolean,
      "--directory": Boolean,
      "--store": Boolean,
      "-a": "--atom",
      "-m": "--molecule",
      "-o": "--organism",
      "-p": "--page",
      "-t": "--template",
      "-s": "--store"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    skipActionPromp:
      args["--atom"] ||
      args["--molecule"] ||
      args["--organism"] ||
      args["--template"] ||
      args["--page"] ||
      args["--store"] ||
      false,
    atom: args["--atom"] || false,
    molecule: args["--molecule"] || false,
    organism: args["--organism"] || false,
    template: args["--template"] || false,
    page: args["--page"] || false,
    store: args["--store"] || false,
    moduleName: args._[0],
    targetDirectory: args._[1]
  };
}

function promptForMissingOptions(options) {
  if (!options.skipActionPromp) {
    console.log("specify make action");
    return true;
  }
  if (!options.moduleName) {
    console.log("specify module name");
    return true;
  }
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  if (promptForMissingOptions(options)) {
    return;
  }
  await createTemplate(options);
}
