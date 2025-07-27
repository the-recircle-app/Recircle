## Build

### Requirements

Thor requires `Go` 1.19+ and `C` compiler to build. To install `Go`, follow this [link](https://golang.org/doc/install).

### Clone the repo

Clone the Thor repo:

```shell
git clone https://github.com/vechain/thor.git
cd thor
```

It is recommended to use the latest stable release. To checkout the latest stable release, run:

```shell
git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
```

To see a list of all available commands, run `make help`

### Building

To build the main app `thor`, just run

```shell
make
```

or build the full suite:

```shell
make all
```

If no errors are reported, all built executable binaries will appear in folder *bin*.

```shell
./bin/thor help
```
