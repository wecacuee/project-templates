FROM nvidia/opengl:1.0-glvnd-devel-ubuntu14.04 as glvnd

FROM ros:indigo-ros-base-trusty

ENV TZ America/Los_Angeles
ENV DEBIAN_FRONTEND noninteractive

####### Make OpenGL work with nvidia ### 
# Copied from : https://github.com/osrf/rocker/blob/master/src/rocker/templates/nvidia_snippet.Dockerfile.em

# Open nvidia-docker2 GL support
COPY --from=glvnd /usr/local/lib/x86_64-linux-gnu /usr/local/lib/x86_64-linux-gnu
COPY --from=glvnd /usr/local/lib/i386-linux-gnu /usr/local/lib/i386-linux-gnu
COPY --from=glvnd /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu
COPY --from=glvnd /usr/lib/i386-linux-gnu /usr/lib/i386-linux-gnu
# if the path is alreaady present don't fail because of being unable to append
RUN ( echo '/usr/local/lib/x86_64-linux-gnu' >> /etc/ld.so.conf.d/glvnd.conf && ldconfig || grep -q /usr/local/lib/x86_64-linux-gnu /etc/ld.so.conf.d/glvnd.conf ) && \
    ( echo '/usr/local/lib/i386-linux-gnu' >> /etc/ld.so.conf.d/glvnd.conf &&  ldconfig || grep -q /usr/local/lib/i386-linux-gnu /etc/ld.so.conf.d/glvnd.conf )


ENV LD_LIBRARY_PATH /usr/local/lib/x86_64-linux-gnu:/usr/local/lib/i386-linux-gnu${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}

COPY --from=glvnd /usr/local/share/glvnd/egl_vendor.d/10_nvidia.json /usr/local/share/glvnd/egl_vendor.d/10_nvidia.json

ENV NVIDIA_VISIBLE_DEVICES ${NVIDIA_VISIBLE_DEVICES:-all}
ENV NVIDIA_DRIVER_CAPABILITIES ${NVIDIA_DRIVER_CAPABILITIES:+$NVIDIA_DRIVER_CAPABILITIES,}graphics
####### Make OpenGL work with nvidia ### 


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
    git


RUN apt-get update \
 && apt-get install -y \
    libblas-dev \
    libcoin80-dev \
    libeigen3-dev \
    liblapack-dev \
    libqhull-dev \
    libqt4-dev \
    libqt4-opengl-dev \
    libqt4-sql-psql \
    libsoqt4-dev

RUN mkdir -p /root/code
COPY graspit /root/code/graspit
WORKDIR /root/code/graspit
ENV GRASPIT /root/code/graspit
RUN { [ -d build ] && rm -rf build; } && \
    mkdir -p build && \
    cd build && \
    cmake .. && \
    make -j && \
    make install

RUN apt-get update \
 && apt-get install -y \
    ros-indigo-catkin

RUN mkdir -p /root/code/ros_ws/src
WORKDIR /root/code/ros_ws/
RUN cd src && \
    git clone https://github.com/graspit-simulator/graspit-ros --recursive && \
    cd .. && \
    . /opt/ros/indigo/setup.sh && \
    catkin_make

RUN pip3 install --upgrade pip

RUN apt-get clean

ARG USER
ARG HOME
ARG UID
RUN groupadd -g "2000" "$USER" \
 && useradd --uid "${UID}" -s "/bin/bash" -c "$USER" -g "2000" -d "$HOME" "$USER" \
 && echo "$USER:$USER" | chpasswd \
 && adduser $USER sudo \
 && echo "$USER ALL=NOPASSWD: ALL" >> /etc/sudoers.d/$USER
# Commands below run as the developer user
USER $USER
ARG PWD
WORKDIR $PWD
ENTRYPOINT /bin/bash
