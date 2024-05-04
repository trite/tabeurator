// Super simple logger because I don't need more than this yet

// Not exported since I expect to add more and change this list later and want to limit coupling
enum Level {
  Debug = "debug",
  Off = "off",
  // Info = "info",
  // Warn = "warn",
  // Error = "error",
}

// TODO: Make this configurable
const logLevel = Level.Debug;

export const logDebug = (message?: any, ...optionalParams: any[]): void => {
  if (logLevel === Level.Debug) {
    console.log(message, ...optionalParams);
  }
};
