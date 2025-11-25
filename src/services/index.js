import Users from "../dao/users.dao.js";
import Pet from "../dao/pets.dao.js";
import Adoption from "../dao/adoption.js";

import UserRepository from "../repository/user.repository.js";
import PetRepository from "../repository/pet.repository.js";
import AdoptionRepository from "../repository/adoption.repository.js";

export const usersService = new UserRepository(new Users());
export const petsService = new PetRepository(new Pet());
export const adoptionsService = new AdoptionRepository(new Adoption());
