<center>
<p align="center">
<h1> NitroGen </h1>
<a href="https://github.com/iKasu2k/nitrogen"><img alt="GitHub license" src="https://img.shields.io/github/license/iKasu2k/nitrogen"></a> <a href="https://github.com/iKasu2k/nitrogen/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/iKasu2k/nitrogen"></a> <a href="https://github.com/iKasu2k/nitrogen/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/iKasu2k/nitrogen"></a>
<h4>A small tool to generate and check Discord Nitro Gift Codes automatically using TOR as proxy. </h4>
</p>
</center>

## Why NitroGen :question:
Traditional scrapers require a list of proxies or utilize free proxy websites to send anonymous requests. In most cases, those free proxies are most likely non-working or getting blocked relatively fast. Finding good and reliable proxies on the other hand can be time consuming or cost intensive.

To circumvent this issue, NitroGen will spawn a previously defined amount of TOR Nodes, each providing a socks5 proxy to be used to send requests to Discord. Each Node is configured to change its IP Address every 10 seconds, allowing to send subsequent requests without being rate limited. With 8 Nodes, ~2-3 requests were sent each second.

## Table of Contents :book:
- [Why NitroGen :question:](#why-nitrogen-question)
- [Table of Contents :book:](#table-of-contents-book)
- [Install Instructions :wrench:](#install-instructions-wrench)
  - [Pre Requirements :exclamation:](#pre-requirements-exclamation)
  - [Setup](#setup)
- [Usage :package:](#usage-package)
    - [TOR Nodes](#tor-nodes)
    - [Start Scraper in CLI](#start-scraper-in-cli)
- [License :zap:](#license-zap)

## Install Instructions :wrench:
Before running the Scraper, please make sure you meet the pre requirements to avoid any conflicts while running the scraper. 
TOR must be installed and the user running the scraper requires permission to invoke `tor` on the command line via `child_process.exec`
### Pre Requirements :exclamation:
Please make sure you've TOR installed on your system and can be invoked using `tor` in the command line!
Most Linux distributions provide a package that can be installed using the system package manager, for example: 

```sh
# Debian, Ubuntu, etc.
$ apt install tor
```
```sh
# Fedora
$ dnf install tor
```
```sh
# CentOS, RHEL, ...
$ yum install tor
```
```sh
# Gentoo
$ emerge tor
```
```sh
# Arch Linux
$ pacman -S tor
```
<br />

When TOR is installed, create a new file at `/etc/tor/torrc.2` and copy the following content:
```bash
MaxCircuitDirtiness 10
NewCircuitPeriod 10

SocksPort 9060
DataDirectory /var/lib/tor2
```

### Setup
Fork `master` branch into your personal repository or clone it directly from the main repository. Install node modules.

```javascript
$ git clone https://github.com/iKasu2k/nitrogen.git
$ cd nitrogen
$ npm install
```

## Usage :package:
#### TOR Nodes
The amount of TOR Nodes spawned is controlled via the ENV variable TOR_COUNT. Default start script will set TOR_COUNT to 8. If TOR_COUNT is not set, the scraper will not start!

#### Start Scraper in CLI
To start the TOR Nodes and the Scraper, simply run the following command:
```sh
$ npm run start
```

> :exclamation: If any errors occur, the scraper will stop sending requests, kill TOR Nodes an will wait for user Input. This is currently a bug and will be fixed in a future version.
To avoid any issues after a crash, you can run the following command to kill all TOR Nodes and delete the temporary files and folders created by the scraper.
> ```sh
> $ npm run kill
> ```
Working codes can be found inside the `/src/logs/codes.log` file. Full log is available in `/src/logs/full.log`


## License :zap:
This code is licensed under the terms of the The Unlicense license and is available for free.