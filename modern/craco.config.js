const million = require("million/compiler");

module.exports = {
  webpack: {
    plugins: {
      add: [
        million.webpack({
          auto: {
            threshold: 0.05,
            skip: ["useBadHook", /badVariable/g],
          },
        }),
      ],
    },
  },
};