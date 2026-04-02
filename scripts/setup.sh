#!/bin/bash
# setup.sh — Bootstrap máquina nueva
# Uso: bash setup.sh

set -e

echo "🚀 EfrainGaray dotfiles setup"

# Git config
git config --global user.name "Efrain Garay"
git config --global user.email "tu@email.com"
git config --global core.editor "code --wait"

# Clonar submodulos si no están
git submodule update --init --recursive

# Verificar herramientas esenciales
check_tool() {
  if ! command -v "$1" &> /dev/null; then
    echo "⚠️  $1 no encontrado — instala manualmente"
  else
    echo "✅ $1 $(${1} --version 2>&1 | head -1)"
  fi
}

echo ""
echo "📦 Verificando herramientas..."
check_tool git
check_tool docker
check_tool rustc
check_tool cargo
check_tool go
check_tool node
check_tool npm
check_tool python3
check_tool flutter
check_tool gh

echo ""
echo "✅ Setup completo"
echo "📖 Lee CLAUDE.md para entender la configuración"
