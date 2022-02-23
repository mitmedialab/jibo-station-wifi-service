### (Don't edit below, unless you are a maintener of this package)

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Specify where node should be installed (default is 'node' folder -- probably keep it that way unless you have a good reason)
LOCAL_NODE_INSTALL_DIRECTORY="$SCRIPT_DIR/node"

# Retrieve node version to be installed/activated
VERSION_FILE="$SCRIPT_DIR/version.bash";
source $VERSION_FILE

# 1. Make sure desired version is installed (install it, if not)
$SCRIPT_DIR/install.sh $LOCAL_NODE_INSTALL_DIRECTORY $VERSION

# 2. Add local node binaries to system PATH variable 
export PATH="$LOCAL_NODE_INSTALL_DIRECTORY/bin":$PATH

# 3. Display 'activated' node version in bash prompt
ACTIVE_NODE_VERSION=`node --version`
PREFIX="local node:"
# Avoid displaying multiple 'local node readouts'
# (FYI: The below uses bash's 'sed' [stream editor] functionality along with regex to subsitute & add information to the PS1, 'custom prompt' environment variable)
DISPLAY=$(echo $PS1 | sed 's/\(($PREFIX[^)]*\))//' | sed 's/^/($PREFIX $ACTIVE_NODE_VERSION)/')
PS1="$DISPLAY "