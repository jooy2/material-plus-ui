#!/bin/sh
# Copies the screenshots of an integration test run off a device.
#
#   tool/pull_screenshots.sh ios <simulator id> <folder>
#   tool/pull_screenshots.sh ios-device <device id> <folder>
#   tool/pull_screenshots.sh android <emulator serial> <folder>
set -eu

platform=$1
device=$2
target=$3

mkdir -p "$target"

case "$platform" in
  ios)
    container=$(xcrun simctl get_app_container "$device" com.cdget.materialplus.materialPlusShowcase data)
    cp -R "$container/tmp/mp-shots/." "$target/"
    ;;
  ios-device)
    xcrun devicectl device copy from --device "$device" \
      --domain-type appDataContainer --domain-identifier com.cdget.materialplus.materialPlusShowcase \
      --source tmp/mp-shots --destination "$target"
    ;;
  android)
    adb -s "$device" exec-out run-as com.cdget.materialplus.material_plus_showcase tar c code_cache/mp-shots |
      tar -x -C "$target" --strip-components=2
    ;;
  *)
    echo "Unknown platform: $platform (ios, ios-device or android)" >&2
    exit 1
    ;;
esac
