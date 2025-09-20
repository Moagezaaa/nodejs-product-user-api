const { dbGet, dbAll, dbRun } = require('../utils/dbproduct');
async function nameExcit(name) {
    const row = await dbGet('SELECT * FROM product WHERE name = ?', [name]);
    if (!row) {
        return false
    }
    return true
}

function validateName(name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
        return false
    }
    return true
}

function validatePrice(price) {
    if (price == null || isNaN(price) || price <= 0) {
        return false
    }
    return true
}
function validateAmount(amount) {
    if (amount == null || isNaN(amount) || amount < 0) {
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
    nameExcit,
    validateName,
    validatePrice,
    validateAmount,
    validatePage,
    validateLimit
};
