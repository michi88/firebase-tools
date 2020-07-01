import { Command } from "../command";
import * as controller from "../emulator/controller";
import * as commandUtils from "../emulator/commandUtils";
import * as optionsHelper from "../extensions/emulator/optionsHelper";
import * as utils from "../utils";
import { FirebaseError } from "../error";

module.exports = new Command("ext:dev:emulators:start")
  .description("start the local Firebase extension emulator")
  .option(commandUtils.FLAG_INSPECT_FUNCTIONS, commandUtils.DESC_INSPECT_FUNCTIONS)
  .option(commandUtils.FLAG_TEST_CONFIG, commandUtils.DESC_TEST_CONFIG)
  .option(commandUtils.FLAG_TEST_PARAMS, commandUtils.DESC_TEST_PARAMS)
  .option(commandUtils.FLAG_IMPORT, commandUtils.DESC_IMPORT)
  .option(commandUtils.FLAG_EXPORT_ON_EXIT, commandUtils.DESC_EXPORT_ON_EXIT)
  .action(async (options: any) => {
    options = commandUtils.setExportOnExitOptions(options);
    const killSignalPromise = commandUtils.shutdownWhenKilled(options);

    const emulatorOptions = await optionsHelper.buildOptions(options);
    try {
      commandUtils.beforeEmulatorCommand(emulatorOptions);
      await controller.startAll(emulatorOptions);
    } catch (e) {
      await controller.cleanShutdown();
      if (!(e instanceof FirebaseError)) {
        throw new FirebaseError("Error in ext:dev:emulator:start", e);
      }
      throw e;
    }

    utils.logSuccess("All emulators ready, it is now safe to connect.");

    // Hang until explicitly killed
    await killSignalPromise;
  });
