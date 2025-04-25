module.exports = {
  packagerConfig: {
    asar: false,
    icon: "./src/images/causal-studio-icon",
    extraResource: ["./resources/cli"]
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupIcon: "./src/images/causal-studio-icon.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: "./src/images/causal-studio-icon.png",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    // uses asar
    // {
    //   name: "@electron-forge/plugin-auto-unpack-natives",
    //   config: {},
    // },
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              name: "main_window",
              html: "./src/index.html",
              js: "./src/js/renderer/renderer.js",
              preload: {
                js: "./src/js/preload/preload.js",
              },
            },
          ],
        },
      },
    },
  ],
};
