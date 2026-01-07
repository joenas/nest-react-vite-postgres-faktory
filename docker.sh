#!/bin/bash
set -o errexit  # abort on nonzero exitstatus
set -o nounset  # abort on unbound variable
set -o pipefail # don't hide errors within pipes

usage() {
  echo "Usage: $0 [build] [run] [push] [arch]"
  echo "  Actions: any combination of build, run, push (in order)"
  echo "  [arch]: optional, amd64 or arm64 (default: machine arch)"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

# Map uname -m to docker arch
get_machine_arch() {
  local mach_arch
  mach_arch=$(uname -m)
  case "$mach_arch" in
  x86_64)
    echo "amd64"
    ;;
  arm64 | aarch64)
    echo "arm64"
    ;;
  *)
    echo "❌ Unsupported machine architecture: $mach_arch" >&2
    exit 1
    ;;
  esac
}

last_arg="${!#}"
if [[ "$last_arg" =~ ^(amd64|arm64)$ ]]; then
  arch="$last_arg"
  set -- "${@:1:$(($# - 1))}"
else
  arch="$(get_machine_arch)"
fi

imageName="app"
version=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)

for action in "$@"; do
  case "$action" in
  build)
    echo "🛠️ Building linux/$arch, version $version"
    docker build -t $imageName:$version --platform linux/$arch .
    ;;
  run)
    echo "❌ Run with docker compose instead.."
    ;;
  push)
    if [ -z "${REGISTRY_HOST:-}" ]; then
      echo "❌ \$REGISTRY_HOST is not set"
      exit 1
    fi
    echo "📦 Tagging and pushing to $REGISTRY_HOST/$imageName:$version"
    docker tag $imageName:$version $REGISTRY_HOST/$imageName:$version
    docker push $REGISTRY_HOST/$imageName:$version
    ;;
  *)
    echo "❌ Unknown action: $action"
    usage
    ;;
  esac
done
