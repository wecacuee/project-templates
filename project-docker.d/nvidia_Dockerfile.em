FROM nvidia/opengl:1.0-glvnd-devel-ubuntu18.04 as glvnd

FROM ubuntu:18.04
####### Make OpenGL work with nvidia ### 
# Copied from : https://github.com/osrf/rocker/blob/master/src/rocker/templates/nvidia_snippet.Dockerfile.em

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglvnd0 \
    libgl1 \
    libglx0 \
    libegl1 \
    libgles2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=glvnd /usr/share/glvnd/egl_vendor.d/10_nvidia.json /usr/share/glvnd/egl_vendor.d/10_nvidia.json

ENV NVIDIA_VISIBLE_DEVICES ${NVIDIA_VISIBLE_DEVICES:-all}
ENV NVIDIA_DRIVER_CAPABILITIES ${NVIDIA_DRIVER_CAPABILITIES:+$NVIDIA_DRIVER_CAPABILITIES,}graphics
####### Make OpenGL work with nvidia ### 