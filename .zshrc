
#
# ─── ZPLUG INITIALIZATION ───────────────────────────────────────────────────────
#

# zplug options
export ZPLUG_THREADS=4              # multithreaded download / update

if [[ ! -f ~/.zplug/init.zsh ]]; then
    if (( $+commands[git] )); then
        git clone https://github.com/zplug/zplug ~/.zplug
    else
        echo 'git not found' >&2
        exit 1
    fi
fi

source ~/.zplug/init.zsh


#
# ─── GLOBAL CONFIGURATION ───────────────────────────────────────────────────────
#

# History options
export HISTFILE=~/.zsh_history
export HISTSIZE=200000
export SAVEHIST=100000

# Ignore duplicate history
setopt HIST_EXPIRE_DUPS_FIRST
setopt HIST_IGNORE_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_VERIFY
setopt SHARE_HISTORY

# Directory navigation options
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
setopt PUSHD_MINUS

# Completion options
setopt ALWAYS_TO_END

# Auto-suggestion options
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20

# Sane zsh default options
# <https://github.com/willghatch/zsh-saneopt>
zplug "willghatch/zsh-saneopt"

# Oh-My-Zsh defaults
zplug "robbyrussell/oh-my-zsh", use:"lib/*.zsh"


#
# ─── PROMPT ─────────────────────────────────────────────────────────────────────
#

POWERLEVEL9K_MODE="nerdfont-complete"

POWERLEVEL9K_PROMPT_ON_NEWLINE=false

POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(os_icon context dir dir_writable pyenv vcs)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status nvm root_indicator ssh background_jobs history battery time)

zplug "bhilburn/powerlevel9k", use:powerlevel9k.zsh-theme


#
# ─── COLORIZATION ───────────────────────────────────────────────────────────────
#

# Insanely colorized `ls` colors
# <https://github.com/trapd00r/LS_COLORS>
if [[ -f ~/.dircolors/LS_COLORS ]]; then
    eval $(dircolors -b ${HOME}/.dircolors/LS_COLORS)
fi

# Ditto for Zsh itself
# <https://github.com/trapd00r/zsh-syntax-highlighting-filetypes>
zplug "zsh-syntax-highlighting-filetypes"

# Colorized man pages
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/colored-man-pages>
zplug "plugins/colored-man-pages", from:oh-my-zsh

#
# ─── COMPLETIONS AND SUGGESTIONS ────────────────────────────────────────────────
#

# Zsh additional completitions (misc. programs, very big)
# <https://github.com/zsh-users/zsh-completions>
zplug "zsh-users/zsh-completions", defer:1

# Zsh auto-suggestions (misc., very big)
# <https://github.com/zsh-users/zsh-autosuggestions>
zplug "zsh-users/zsh-autosuggestions", defer:1

# Node Package Manager (npm) completions
# <https://github.com/lukechilds/zsh-better-npm-completion>
zplug "lukechilds/zsh-better-npm-completion", defer:1

# Rancher smart completions
# <https://github.com/go/rancher-zsh-completion>
zplug "go/rancher-zsh-completion", defer:1

# InterPlanetary FileSystem (IPFS) completions
# <https://github.com/aramboi/zsh-ipfs>
zplug "aramboi/zsh-ipfs", defer:1


#
# ─── COMMANDS ───────────────────────────────────────────────────────────────────
#

# sudo plugin
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/sudo>
zplug "plugins/sudo", from:oh-my-zsh

# nmap plugin
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/nmap>
zplug "plugins/nmap", from:oh-my-zsh

# Enhanced CD command
# <https://github.com/b4b4r07/enhancd>
zplug "b4b4r07/enhancd", use:init.sh

# Alias existence warning
# <https://github.com/djui/alias-tips>
zplug "djui/alias-tips"

# Common aliases
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/common-aliases>
zplug "plugins/common-aliases", from:oh-my-zsh


#
# ─── PROGRAMMING AND DEVELOPMENT ────────────────────────────────────────────────
#

# Python Package Manager (pip) plugin
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/pip>
zplug "plugins/pip", from:oh-my-zsh

# Yarn Package Manager plugin
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/yarn>
zplug "plugins/yarn", from:oh-my-zsh

# React.js Native development plugin
# <https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/react-native>
zplug "plugins/react-native", from:oh-my-zsh



# Node Version Manager
# <https://github.com/lukechilds/zsh-nvm>
export NVM_LAZY_LOAD=true   # load asynchronously
export NVM_DIR="${HOME}/.nvm"

zplug "lukechilds/zsh-nvm"


ztermtitle="%n@%m:%~"
zdouble_dot_expand="true"
zhighlighters=(main brackets pattern cursor root)
ZSH_AUTOSUGGEST_USE_ASYNC=true
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_NOT_FOUND='bg=default,fg=red,bold'
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_FOUND='bg=default,fg=blue,bold'




if ! zplug check --verbose; then
  printf "Install? [y/N]: "
  if read -q; then
    echo; zplug install
  fi
fi

zplug load
