import { fakerES as fa } from "@faker-js/faker";
import bcrypt from 'bcrypt';
export const generatePets = (count = 10) => {
  const pets = [];
  for (let i = 0; i < count; i++) {
    const specie = fa.helpers.arrayElement(["dog", "cat", "horse", "rabbit"]);
    pets.push({
      name: specie === "dog" ? fa.animal.dog() : fa.animal.cat(),
      specie, 
      birthDate: fa.date.past({ years: 15 }), 
      adopted: fa.datatype.boolean(),
      owner: null, 
      image: fa.image.urlLoremFlickr({ category: "animals" })
    });
  }
  return pets;
};

export const generateUsers = async (count = 10) => {
  const users = [];
  const hashedPassword = await bcrypt.hash("coder123", 10);

  for (let i = 0; i < count; i++) {
    users.push({
      first_name: fa.person.firstName(),
      last_name: fa.person.lastName(),
      email: fa.internet.email(),
      password: hashedPassword,
      role: fa.helpers.arrayElement(["user", "admin"]),
      pets: [],
    });
  }

  return users;
};