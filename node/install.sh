# Collect input
LOCAL_NODE_INSTALL_DIRECTORY=$1
NODE_VERSION=$2

# Set up path variables
LOCAL_NODE_BIN="$LOCAL_NODE_INSTALL_DIRECTORY/bin"
N_INSTALL_DIRECTORY="$LOCAL_NODE_INSTALL_DIRECTORY/n"
N_EXECUTABLE="$LOCAL_NODE_BIN/n"
VERSION_FILE="$LOCAL_NODE_INSTALL_DIRECTORY/version.txt"

# Determine currently installed node version from version file
if [ -f $VERSION_FILE ]; 
then
  CURRENTLY_INSTALLED_VERSION=$(<$VERSION_FILE)
else
  CURRENTLY_INSTALLED_VERSION="-1"
fi

# Determine if node version needs to be installed
# (if so, do so using 'n' library explained below)
if [[ ! -d $LOCAL_NODE_INSTALL_DIRECTORY || "$NODE_VERSION" != "$CURRENTLY_INSTALLED_VERSION" ]];
then
  # 1. Delete previous contents of node install directory (if they exist) and then recreate directory
  # NOTE: This is not the most efficient, but this shouldn't happen often...
  rm -vrf $LOCAL_NODE_INSTALL_DIRECTORY >/dev/null # send standard output to the null device
  mkdir $LOCAL_NODE_INSTALL_DIRECTORY

  # 2. Check if 'n' Node Version Management Library https://github.com/tj/n has been installed... 
  # ...and install it if not
  if [ ! -f "$N_EXECUTABLE" ]; 
  then
    git clone https://github.com/tj/n $N_INSTALL_DIRECTORY
    (export PREFIX=$LOCAL_NODE_INSTALL_DIRECTORY; cd $N_INSTALL_DIRECTORY; make; make install)
  fi

  # 3. Install the desired node version using the 'n' library installed in the previous step
  # NOTE: Must first specify N_PREFIX so node is intalled in the correct place
  (export N_PREFIX=$LOCAL_NODE_INSTALL_DIRECTORY; $N_EXECUTABLE $NODE_VERSION) 

  # 4. Write to version file which version was just installed
  echo $NODE_VERSION > $VERSION_FILE

  # 5. Cleanup: Remove 'n' library and it's executable to avoid taking up unnecessary space
  # NOTE: Again, this isn't the most efficient thing to do...
  # ...but it won't happen often and seems better to optimize for space
  rm -vrf $N_INSTALL_DIRECTORY >/dev/null # send standard output to the null device
  rm -vrf $N_EXECUTABLE >/dev/null # send standard output to the null device
fi