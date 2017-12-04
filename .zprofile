

#
# ─── TERMINAL CONFIGURATION ─────────────────────────────────────────────────────
#

if [ -n "$TMUX" ]; then
  export TERM=tmux-256color
else
  export TERM=xterm-256color
fi


#
# ─── EDITOR ─────────────────────────────────────────────────────────────────────
#

# Set Visual Studio code as the editor if it exists and we're in Xorg
# otherwise, use nano
(( $+commands[code] )) && export EDITOR=code || export EDITOR=nano
export VISUAL=$EDITOR
export GIT_EDITOR=$EDITOR
export PAGER='less'


#
# ─── LANGUAGE ───────────────────────────────────────────────────────────────────
#

export LANG=en_US.UTF-8
export LC_ALL=$LANG


#
# ─── LESS PAGER ─────────────────────────────────────────────────────────────────
#

# LESS options
export LESS='-F -g -i -M -R -S -w -X -z-4'

# Use lesspipe as the preprocessor
if (( $#commands[(i)lesspipe(|.sh)] )); then
  export LESSOPEN="| /usr/bin/env $commands[(i)lesspipe(|.sh)] %s 2>&-"
fi

#
# ─── GO LANGUAGE ────────────────────────────────────────────────────────────────
#

export GOPATH="~/Projects/Go"
export GOPATH_BIN="${GOPATH}/bin"
export GOPATH_SRC="${GOPATH}/src"
export GOPATH_LIB="${GOPATH}/lib"

#
# ─── BINARY PATH ────────────────────────────────────────────────────────────────
#

export PATH="${PATH}:${HOME}/bin:${HOME}/Applications/bin:${GOPATH_BIN}"


