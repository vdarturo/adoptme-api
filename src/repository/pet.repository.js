import GenericRepository from "./generic.repository.js";

export default class PetRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }
}