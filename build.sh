#!/bin/sh

cbindgen rust-bindings -o bindings.h

cd rust-bindings
cargo build --release
cd ..

g++ -std=c++14 \
    -o main \
    -L rust-bindings/target/release/ \
    -l rust_bindings \
    main.cpp
