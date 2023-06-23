#!/bin/bash

source ~/.bash_profile

set -e

cd /home/pvtotal/pv-total-react

if [ -w /dev/stderr ]
then
        STDERR=/dev/stderr
else
        STDERR=/dev/tty # The only reason is that stderr is a link to console
fi

UPDATE=

# include this once deployment keys were added here
# git pull

if [[ -z $(nvm install --lts 2>&1 >/dev/null | tee $STDERR | egrep "already installed") ]]
then
  UPDATE="1"
fi

if [[ -n $(npm install | tee $STDERR | egrep 'added [0-9] package') ]]
then
  UPDATE="2"
fi

if [[ -z $(npm audit fix | tee $STDERR | egrep 'up to date') ]]
then
  UPDATE="3"
fi


echo $UPDATE

if [[ -n $UPDATE ]]
then
  npm run build

  cd build

  ln -s ../../dataset data
fi

