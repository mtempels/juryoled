#!/bin/bash
#
# Script to install the startup files for main-server
#

# Get shell dir
DIR=$(cd $(dirname "$0"); pwd)

# Settings
SVC="juryoled"
CONF_DIR="/etc/$SVC"
LOG_DIR="/var/log/$SVC"
FILE_SRC="$DIR/files"
UPSTART_TGT="/etc/init"
SYSTEMD_TGT="/lib/systemd/system"
CONF_FILE="config.json"
USER="www-data"


# Check if system is system.d
is_systemd() {
    stat /sbin/init | grep 'File:' | grep systemd > /dev/null
    if [ $? -ne 0 ]; then
        false
    else
        true
    fi
}

# Create config dir if it does not exist
if [ ! -d $CONF_DIR ]; then
    mkdir $CONF_DIR
fi

# Copy default config file if it does not exist
if [ ! -f "$CONF_DIR/$CONF_FILE" ]; then
    cp $FILE_SRC/$CONF_FILE $CONF_DIR/
fi

# Create log dir if it does not exist
if [ ! -d "$LOG_DIR" ]; then
    mkdir $LOG_DIR
fi

# Set ownership of log dir (and everything below)
chown -R $USER.$USER $LOG_DIR

# Determine node path
NODE_PATH=$(dirname $(which node))
if [ -z "$NODE_PATH" ]; then
    echo
    echo "Error: No node path could be determined!"
    echo
    exit 1
fi

if is_systemd; then
    # Copy system.d config file, replacing placeholders
    cat $FILE_SRC/$SVC.service | sed s?#NODE_PATH#?$NODE_PATH?g > $SYSTEMD_TGT/$SVC.service
    systemctl enable $SVC.service
    echo
    echo "type 'systemctl start $SVC' to start the service"
    echo
else
    # Copy upstart config file, replacing placeholders
    cat $FILE_SRC/$SVC.conf | sed s?#NODE_PATH#?$NODE_PATH?g > $UPSTART_TGT/$SVC.conf
    echo
    echo "type 'start $SVC' to start the service"
    echo
fi
