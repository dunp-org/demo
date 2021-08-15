# dunp protocol demo

Demo app on IPFS: https://ipfs.io/ipfs/Qmc5oGdvJiUuEvX6HLy3S5B79pgjqMUobvi7LKbmYj7h4U/

Based on [Bootstrap Framework](http://getbootstrap.com/) version 4 and uses [Webpack](https://webpack.js.org/) as a flexible and modern module bundler. All common features for front-end projects (like SCSS compilation, minifying of Assets, etc.) are included out of the box.

In addition to the basic front-end project setup, I added some cool features like a configurable image resizing command to make generating responsive images a breeze.

## 1. Features

- [Webpack](https://webpack.js.org) is used as a modern JavaScript module bundler.
- [Babel](https://babeljs.io/) lets you write ES6 compatible JavaScript code.
- [Autoprefixer](https://autoprefixer.github.io/) cares about vendor prefixes in CSS.

## 2. Quick Start

1. Install needed dependencies

   ```bash
   npm install
   ```

5. Run the start command

   ```bash
   npm start
   ```

The start command will start Webpack and tell it to watch for changes in JS and SCSS files, to recompile the needed assets.

## 3. Build for production

```bash
npm run build
```

This command tells webpack to run in production mode and compiles all of the assets in a minified version, to deliver smaller files for your users.

## 4. Environment Configurations

If you use sensitive information in your code, like API keys or encryption tokens, you should never store those in your code repository. This can could lead to a security issue, especially if the repository is public.

Therefore I included the [dotenv-webpack](https://github.com/mrsteele/dotenv-webpack) plugin in this boilerplate, that enables you to store all your sensitive information in a `.env` file, that is ignored by git.

The `.env.default` file should contain all the variables that your application needs, but without the real data and should contain either empty variables or default values that can be used by everyone. The variables will get replaced during asset compilation so that only those variables are added, that are referenced in your code.

It is a common scheme to use an uppercase syntax for environment variables, as you can see in the example below. Comments inside of .env files start with a hash.

```
# GOOGLE APIs

GOOGLE_MAPS_API_KEY=vEVmihkWZ2fqedyHQT***************
YOUTUBE_API_KEY=TnJ8YOfVuL9bbFH83T13N****************

# CACHING
CACHE_ENABLED=false
CACHE_TIMEOUT=3600
```

You can test the usage of environment variables by editing the `.envt` file and changing the value of `HELLO`. After re-compiling the assets you should see a message in the developer console, as soon as you visit the demo page.

**Important:**

After each change of the `.env` file you need to reload Webpack, as the environment is only loaded once per runtime. If you've got an active `npm run dev` command, you need to stop and re-run it, for the changes to take effect.

