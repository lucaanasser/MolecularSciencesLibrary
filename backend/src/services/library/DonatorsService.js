const donatorsModel = require('../../models/library/DonatorsModel');

class DonatorsService {
    async addDonator(data) {
        return donatorsModel.addDonator(data);
    }

    async removeDonator(id) {
        return donatorsModel.removeDonator(id);
    }

    async getAllDonators() {
        return donatorsModel.getAllDonators();
    }

    async getDonatorById(id) {
        return donatorsModel.getDonatorById(id);
    }

    async getFilteredDonators(filters) {
        return donatorsModel.getFilteredDonators(filters);
    }
}

module.exports = new DonatorsService();
