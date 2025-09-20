
function validateName(name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
        return false
    }
    return true
}
function validatePassword(Password) {
    if (!Password || Password.length<6 || !Password.trim()) {
        return false
    }
    return true
}
function validatePage(page) {
    if (page == null || isNaN(page) || page < 1) {
        return false
    }
    return true
}
function validateLimit(limit) {
    if (limit == null || isNaN(limit) || limit < 1) {
        return false
    }
    return true
}
module.exports = {
    validateName,
    validatePassword,
    validatePage,
    validateLimit
};