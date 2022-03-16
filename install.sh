#!/bin/sh

# install git submodules
git submodule init
git submodule update
virtualize/install.sh

### as you add virtualize modules (node, python, etc...) you will
### probably want to edit the following sections and enable them

### node
# yarn install

### python
# pip install -f requirments.txt
