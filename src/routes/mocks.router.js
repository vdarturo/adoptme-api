import { Router } from "express";
import { generatePets, generateUsers } from "../mocks/mocks.js";
import petModel from "../dao/models/Pet.js";
import userModel from "../dao/models/User.js";

const router = Router();

router.get("/mockingpets", async (req, res) => {
  try {
    const pets = generatePets(5); 
    res.json({ status: "success", payload: pets });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/mockingusers", async (req, res) => {
  try {
    const users = await generateUsers(50);
    res.json({ status: "success", payload: users });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/generateData", async (req, res) => {
  try {
    const { users = 0, pets = 0 } = req.body;

    const mockUsers = await generateUsers(Number(users));
    const mockPets = generatePets(Number(pets));

    if (mockUsers.length > 0) await userModel.insertMany(mockUsers);
    if (mockPets.length > 0) await petModel.insertMany(mockPets);

    res.json({
      status: "success",
      inserted: {
        users: mockUsers.length,
        pets: mockPets.length,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;