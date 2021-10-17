#!/usr/bin/env node

/**
 * @fileOverview Main entry point of the server
 * @name index.js
 * @author Matthijs Tempels <matthijs@townsville.nl>
 * @license Townsville.nl
 */

"use strict";

const fs = require('fs');
const logger = require('townsville-logger');
const nconf = require('nconf');
const Service = require('./server/index.js');
const util = require('util');
const path = require('path');

global.appRoot = path.resolve(__dirname);

/**
 * Show usage and exit
 */
function doUsageExit() {
  console.log(util.format('Usage: %s [options]', process.argv[1]));
  console.log(' options:');
  console.log(' --conf <json config file> (mandatory)');
  console.log(' --help');
  process.exit(1);
}

/**
 * Handle commandline
 */
function handleCommandLine() {
  // Favor commandline params
  nconf.argv();

  // Check help
  if (nconf.get('help') || !(nconf.get('conf'))) {
    doUsageExit();
  }

  // Check config file
  let path = nconf.get('conf');
  if (!fs.existsSync(path)) {
    console.log(util.format('Config file "%s" not found', path));
    doUsageExit();
  }

  try {
    nconf.file({
      file: path
    });
  } catch (err) {
    console.log(err);
    doUsageExit();
  }
}

/**
 * Obtain application version
 * @returns {string} Version string
 */
function getVersion() {
  try {
    let pkgJson = require(__dirname + '/package.json');
    if (pkgJson && pkgJson.version) {
      return pkgJson.version;
    }
  } catch (err) { }
  return '[unknown]';
}

// --- Main program ---

let log;
let inst;

// Catch fatal error and log it
process.on('uncaughtException', (err) => {

  if (log) {
    log.fatal(err.stack);
  }

  // Close the service
  if (inst) {
    inst.close();
  }

  // Wait a bit before exit (and hope the log flushes)
  setTimeout(
    () => {
      process.exit(1);
    },
    1000
  );
});

// Handle commandline
handleCommandLine();

// Get log settings
logger.init(nconf.get('logSettings'));
log = logger.createLogger('index');
log.info('Application V%s started', getVersion());
log.info(nconf.get('conf'));
// Instantiate service
inst = new Service(nconf.get('serviceSettings'), nconf);
inst.run();
