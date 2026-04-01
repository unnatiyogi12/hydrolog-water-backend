import waterModel from "../models/water.model.js";

export const addWater = async (req, res) => {
  try {
    const userId = req.userId; 
    const today = new Date().toISOString().split("T")[0];

    let record = await waterModel.findOne({ user: userId, date: today });

    if (!record) {
      record = await waterModel.create({
        user: userId,
        amount: 1,
        date: today
      });
    } else {
      record.amount += 1;
      await record.save();
    }

    res.json({ message: "Water added 💧", total: record.amount });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWater = async (req, res) => {
  const userId = req.userId;
  const today = new Date().toISOString().split("T")[0];

  const record = await waterModel.findOne({ user: userId, date: today });

  res.json({ total: record?.amount || 0 });
};

export const getWeeklyData = async (req, res) => {
  try {
    const userId = req.userId;

    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const date = d.toISOString().split("T")[0];

      const record = await waterModel.findOne({
        user: userId,
        date
      });

      last7Days.push({
        date,
        amount: record ? record.amount : 0
      });
    }

    res.json({ data: last7Days });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStreak = async (req, res) => {
  try {
    const userId = req.userId;

    const records = await waterModel
      .find({ user: userId })
      .sort({ date: -1 });

    let streak = 0;

    for (let rec of records) {
      if (rec.amount >= 8) streak++;
      else break;
    }

    res.json({ streak });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const leaderboard = async (req, res) => {
  try {
    const topUsers = await waterModel.aggregate([
      {
        $group: {
          _id: "$user",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    res.json({ topUsers });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};