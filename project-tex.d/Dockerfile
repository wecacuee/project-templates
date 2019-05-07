# Preamble from extension [home]

# Preamble from extension [x11]

# Preamble from extension [user]


FROM pytorch/pytorch:latest
# Snippet from extension [home]

# Snippet from extension [x11]

# Snippet from extension [user]
# make sure sudo is installed to be able to give user sudo access in docker
RUN apt-get update \
 && apt-get install -y \
    sudo \
    build-essential \
 && apt-get clean

RUN apt-get update \
    && apt-get install -y \
    texlive-science \
    bibtex2html

ARG USER
ARG HOME
ARG UID
RUN groupadd -g "2000" "$USER" \
 && useradd --uid "$UID" -s "/bin/bash" -c "$USER" -g "2000" -d "$HOME" "$USER" \
 && echo "$USER:$USER" | chpasswd \
 && adduser $USER sudo \
 && echo "$USER ALL=NOPASSWD: ALL" >> /etc/sudoers.d/$USER
# Commands below run as the developer user
USER $USER
ARG PWD
WORKDIR $PWD
ENTRYPOINT /bin/bash
