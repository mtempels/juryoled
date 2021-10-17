/**
 * @fileOverview Main Server
 * @name index.js
 * @author Matthijs Tempels <matthijs@townsville.nl>
 * @license Townsville.nl
 */

"use strict";

const logger = require('townsville-logger');

//setup express

const i2c = require('i2c-bus');
const i2cBus = i2c.openSync(1);
const oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');
const si = require('systeminformation');

const opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

const Oled = new oled(i2cBus, opts);
const OledText = ["IP:", "TIJD:", "SCHOTKLOK:", "THUIS:", "UIT:"];

const httpclient = require('http');
const httpsclient = require('https');

const zeroPad = (num, places) => String(num).padStart(places, '0');

/**
 * Main service class
 */
class Service {

  /**
   * Class constructor
   * @param {object} settings Service settings
   */
  constructor(settings, nconf) {
    this._init(settings, nconf);
  }

  /**
   * Run service
   */
  run() {

  }

  /**
   * Close service
   */
  close() {

  }

  // ---- Private ----

  /**
   * Init class
   * @param {object} settings Settings object
   * @throws {Error} If settings are bad
   */

  _init(settings, nconf) {

    Oled.clearDisplay();
    // Sanity checks
    if (!settings) {
      throw new Error('Service requires a valid settings object');
    }
    this._log = logger.createLogger('juryoled');

    // pick the right client
    var client;
    if (settings.clientType == "http") {
      client = httpclient;
    } else if (settings.clientType == "https") {
      client = httpsclient;
    } else {
      this._log.error("invalid clientType in config");
      process.exit(1);
    }

    setInterval(() => {
      client.get(settings.timeURL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          try {
            data = JSON.parse(data);
            if (data.status === "OK") {
              OledText[1] = "Tijd:" + zeroPad(data.minute, 2) + ":" + zeroPad(data.second, 2) + " / Per:" + data.period + "   ";
            }
          } catch (err) {
            // niks mee doen
          }
        });
      }).on("error", (err) => {
        this._log.error("Error: " + err.message);
      });

      client.get(settings.scoreURL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          try {
            data = JSON.parse(data);
            if (data.status === "OK") {
              OledText[3] = "THUIS:" + zeroPad(data.home, 2);
              OledText[4] = "UIT:" + zeroPad(data.guest, 2)
            }
          } catch (err) {
            // niks mee doen
          }
        });
      }).on("error", (err) => {
        this._log.error("Error: " + err.message);
      });

      client.get(settings.shotclockURL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          try {
            data = JSON.parse(data);
            if (data.status === "OK") {
              OledText[2] = "Schotklok:" + zeroPad(data.time, 2);
            }
          } catch (err) {
            // niks mee doen
          }
        });
      }).on("error", (err) => {
        this._log.error("Error: " + err.message);
      });
    }, 200);

    setInterval(() => {
      this._updateOled();
    }, 2000);

  }
  _updateOled() {
    si.networkInterfaceDefault((defaultif) => {
      si.networkInterfaces((data) => {
        data.forEach(element => {
          if (element.iface === defaultif) {
            OledText[0] = "IP:" + element.ip4;
          }
        });
      });
    });

    Oled.setCursor(1, 1);
    Oled.writeString(font, 1, OledText[0] + "\n" + OledText[1] + "\n" + OledText[2] + "\n" + OledText[3] + "\n" + OledText[4], true);
  }
}

// Exports
module.exports = Service;