const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

const FILE_NAME = "adi-registration.properties";

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectRoot = config.modRequest.platformProjectRoot;
      const sourcePath = path.join(projectRoot, "assets", FILE_NAME);
      const targetDir = path.join(
        androidProjectRoot,
        "app",
        "src",
        "main",
        "assets",
      );
      const targetPath = path.join(targetDir, FILE_NAME);

      if (!fs.existsSync(sourcePath)) {
        throw new Error(`${FILE_NAME} was not found at ${sourcePath}`);
      }

      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);

      return config;
    },
  ]);
};
