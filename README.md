===
OA Jurytafel!


### Install
Use git-hub(ssh):
	
	* install a version of node >= 12
	* sudo npm -g install mtempels/jurytafel
	* When installing as root, use the additional option --unsafe-perm
	* optionally to create upstart/systemd service:
	* sudo npm -g explore jurytafel -- npm run setup
### config
in the config file you can edit the 3 urls to get the basic information from the raspberry's
you also set the home and away teamname

```
{
  "serviceSettings": {
    "clientType": "https",
    "timeURL": "https://www.townsville.nl/oa/scorebord/time/",
    "scoreURL": "https://www.townsville.nl/oa/scorebord/score/",
    "shotclockURL": "https://www.townsville.nl/oa/shotclock/time/",
    "home": "THUIS",
    "guest": "GAST",
    "host": "0.0.0.0",
    "port": 3000
  },
  "logSettings": {
    "name": "jurytafel-server",
    "showName": true,
    "level": "debug",
    "console": {
      "colorize": true
    },
    "file": {
      "path": "/tmp/jurytafel-server.log",
      "rollingFile": {
        "maxSize": 10000000,
        "maxFiles": 20
      }
    }
  }
}
```
