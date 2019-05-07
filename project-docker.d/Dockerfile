%%%nvidia_Dockerfile%%%
ENV TZ America/Los_Angeles
ENV DEBIAN_FRONTEND noninteractive

# make sure sudo is installed to be able to give user sudo access in docker
# Level 1 packages
RUN apt-get update \
 && apt-get install -y \
    ssh \
    sudo \
    cmake \
    build-essential \
    libproj-dev \
    python3-pip \
    python3-tk \
    pkgconf \
    x11-apps \
    net-tools \
    iputils-ping \
    git

RUN pip3 install --upgrade pip matplotlib ipython

ENTRYPOINT /bin/bash

%%%user_home_Dockerfile%%%
