ARG USER=root
ARG HOME=/root
ARG UID=1000
ARG GID=2000
RUN groupadd -g "$GID" "$USER" \
 && useradd --uid "$UID" -s "/bin/bash" -c "$USER" -g "$GID" -d "$HOME" "$USER" \
 && echo "$USER:$USER" | chpasswd \
 && adduser $USER sudo \
 && echo "$USER ALL=NOPASSWD: ALL" >> /etc/sudoers.d/$USER
# Commands below run as the developer user
USER $USER
ARG PWD=/root/code
WORKDIR $PWD