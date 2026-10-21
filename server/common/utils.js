// server/common/utils.js

export const makeCode = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

export const toId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export default { makeCode, toId };
