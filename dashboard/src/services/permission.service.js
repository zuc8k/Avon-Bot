module.exports = {
  isOwner(user) {
    return user.role === 'owner';
  },

  isAdmin(user) {
    return user.role === 'admin' || user.role === 'owner';
  }
};