import type { NextApiRequest, NextApiResponse } from "next"

// This is a mock database. In a real application, you'd use a real database.
const medicinesDB = [
  { id: 1, name: "Paracetamol", description: "Pain reliever and fever reducer" },
  { id: 2, name: "Ibuprofen", description: "Nonsteroidal anti-inflammatory drug" },
  { id: 3, name: "Aspirin", description: "Pain reliever, fever reducer, and blood thinner" },
  { id: 4, name: "Amoxicillin", description: "Antibiotic to treat bacterial infections" },
  { id: 5, name: "Loratadine", description: "Antihistamine for allergy relief" },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { search } = req.query

  if (typeof search !== "string") {
    return res.status(400).json({ error: "Invalid search query" })
  }

  const filteredMedicines = medicinesDB.filter((medicine) => medicine.name.toLowerCase().includes(search.toLowerCase()))

  res.status(200).json(filteredMedicines)
}

