module.exports = {
  hooks: {
    "commit-msg": "npx --no-install commitlint -e ${HUSKY_GIT_PARAMS[0]}",
  },
};
