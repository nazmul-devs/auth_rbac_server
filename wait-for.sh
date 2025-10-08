#!/bin/sh
# wait-for.sh

set -e

host_port=$1
shift
cmd="$@"

host=$(echo $host_port | cut -d':' -f1)
port=$(echo $host_port | cut -d':' -f2)

echo "Waiting for $host:$port..."

until nc -z "$host" "$port"; do
  echo "Waiting for $host:$port..."
  sleep 1
done

echo "$host:$port is up. Running command..."
exec $cmd
