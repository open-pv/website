[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.openpv.de%2F)](https://www.openpv.de/)


# The OpenPV website
This is the base repository for the website [openpv.de](https://www.openpv.de). The website is built using
* [React](https://react.dev/)
* [Chakra-UI](https://v2.chakra-ui.com)
* [Three.js](https://threejs.org/)

The whole site is **static**, reducing the hosting costs as much as possible. The shading simulation happens in the browser, using
our npm package [simshady](https://github.com/open-pv/simshady).

## Setup

If you want to deploy this website locally, you need to follow these steps:

1. Clone the repository and enter it.
2. Make sure that you have [node](https://nodejs.org/en) and the node package manager npm installed. Check this by running
    ```
    node --version
    npm --version
    ```
3. Install all required packages from `package.json` by running
    ```shell
    npm install
    ```
4. To build the code and host it in a development environment, run
    ```shell
    npm run dev
    ```
    and visit [localhost:5173](http://localhost:5173).

## How does this work?
We have a detailed description in german and english on our [About Page](https://www.openpv.de/about). 

## Funding
We thank our sponsors.

<a href="https://prototypefund.de/">
  <img src='https://github.com/open-pv/.github/assets/74312290/9dfa1ce4-adaf-4638-9cbc-e519b033331b' width='300'>
</a>
