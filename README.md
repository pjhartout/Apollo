# Apollo

_Apollo is an easy to use web application to select gene lists whose expression differs widely between any combination of healthy (GTEx) and/or cancerous (TCGA) tissues._

This web app is graciously hosted by [Amsterdam UMC servers](https://hgserver3.amc.nl/apollo).

Our paper explaining this application is currently under review.

## Installation

1. Clone the repository

```bash
git clone git@github.com:pjhartout/Apollo.git
cd nextjs-app/
```

2. Install `NVM`

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 16.13.1
nvm use 16.13.1
```

3. Install `pyenv`

```bash
cd ../ # you should now be in the project's root directory
```

If you have already installed a virtual environment with Python 3.9, you can skip this step. If not, follow the installation instructions on [github.com/pyenv/pyenv#installation](https://github.com/pyenv/pyenv#installation).

Install a Python 3.9.7 virtual environment:

```bash
pyenv install 3.9.7
pyenv local 3.9.7
```

4. Install and download files

```bash
make install
```

## Development Server (with hot reload)

```bash
nvm use 16.13.1
npm run dev
```

## Deploying _Apollo_

```bash
nvm use 16.13.1
make deploy
```

On Unix, `make deploy` will automatically download all required files as well as build a production-ready version of _Apollo_.

Navigate to `127.0.0.1:3000` in your browser to use the webapp (works for both
the development and production build).

## Data reproducibility

Refer to [data_preparation/README.md](data_preparation/README.md).
