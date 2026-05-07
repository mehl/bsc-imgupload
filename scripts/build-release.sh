#!/bin/sh
set -e

VERSION=$(node -p "require('./package.json').version")
IMAGE="imgupload:$VERSION"

echo "Building $IMAGE ..."
docker build --target runner -t "$IMAGE" .

mkdir -p releases
OUTPUT="releases/imgupload-$VERSION.tar.gz"
echo "Saving image to $OUTPUT ..."
docker save "$IMAGE" | gzip > "$OUTPUT"

echo "Done: $OUTPUT"
