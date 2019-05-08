command -v docker || {
    echo "Install docker " && sudo apt-get install docker
}
command -v docker-compose || {
    echo "Install docker-compose" \
    && sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
}
XAUTH=$(mktemp -d --suffix=.xauth)
xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $XAUTH nmerge -
docker-compose -v $XAUTH -e XAUTHORITY=$XAUTH run terminal

