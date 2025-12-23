module.exports = (req, res, next) => {
  // TEMP AUTH FOR DEVELOPMENT
  // سيتم استبداله بـ Discord OAuth لاحقًا

  req.user = {
    id: '123456789012345678',
    username: 'AVON_DEV',
    role: 'owner' // owner | admin | member
  };

  next();
};