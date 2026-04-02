#!/bin/bash
# setup.sh — Bootstrap máquina nueva para el ecosistema EfrainGaray
# Uso: bash scripts/setup.sh

set -e

echo "================================================"
echo "  EfrainGaray dotfiles setup"
echo "================================================"
echo ""

# Git config
echo "--- Configurando Git ---"
git config --global user.name "Efrain Garay"
git config --global user.email "tu@email.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global pull.rebase true
echo "Git configurado."
echo ""

# Clonar submodulos si no están
echo "--- Actualizando submódulos ---"
git submodule update --init --recursive
echo "Submódulos actualizados."
echo ""

# Verificar herramientas esenciales
check_tool() {
  local tool="$1"
  local description="$2"
  if ! command -v "$tool" &> /dev/null; then
    echo "  [MISSING] $tool — $description"
  else
    local version
    version=$("$tool" --version 2>&1 | head -1)
    echo "  [OK]      $tool — $version"
  fi
}

echo "--- Verificando herramientas ---"
echo ""
echo "Core:"
check_tool git "Control de versiones"
check_tool gh "GitHub CLI"
echo ""

echo "Containerización:"
check_tool docker "Docker Engine"
if command -v docker &> /dev/null; then
  if docker buildx version &> /dev/null; then
    echo "  [OK]      docker buildx — $(docker buildx version 2>&1 | head -1)"
  else
    echo "  [MISSING] docker buildx — Necesario para builds multi-arch"
  fi
fi
echo ""

echo "Rust:"
check_tool rustc "Compilador Rust"
check_tool cargo "Package manager Rust"
if command -v cargo &> /dev/null; then
  if cargo audit --version &> /dev/null 2>&1; then
    echo "  [OK]      cargo-audit — $(cargo audit --version 2>&1)"
  else
    echo "  [MISSING] cargo-audit — Instalar: cargo install cargo-audit"
  fi
fi
echo ""

echo "Go:"
check_tool go "Go compiler"
echo ""

echo "Node.js:"
check_tool node "Node.js runtime"
check_tool npm "Node package manager"
echo ""

echo "Python:"
check_tool python3 "Python 3"
check_tool pip3 "Python package manager"
if command -v pip3 &> /dev/null; then
  if pip3 show pip-audit &> /dev/null 2>&1; then
    echo "  [OK]      pip-audit — instalado"
  else
    echo "  [MISSING] pip-audit — Instalar: pip3 install pip-audit"
  fi
fi
echo ""

echo "Mobile:"
check_tool flutter "Flutter SDK"
echo ""

echo "================================================"
echo "  Setup completo"
echo "================================================"
echo ""
echo "Siguiente paso:"
echo "  Lee CLAUDE.md para entender la configuración global"
echo "  Ejecuta /new-project para crear un proyecto nuevo"
echo ""
