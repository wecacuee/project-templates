FROM nvidia/opengl:1.0-glvnd-devel-ubuntu16.04 as glvnd

FROM ubuntu:16.04

####### Make OpenGL work with nvidia ### 
# Copied from : https://github.com/osrf/rocker/blob/master/src/rocker/templates/nvidia_snippet.Dockerfile.em

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
    net-tools \
    iputils-ping \
    git

RUN pip3 install --upgrade pip matplotlib ipython

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
