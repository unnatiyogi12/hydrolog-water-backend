let subscriptions = [];

export const subscribe = (req, res) => {
  const sub = req.body;
  subscriptions.push(sub);

  res.status(201).json({ message: "Subscribed" });
};


import webpush from "../config/webpush.js";

export const sendNotification = async () => {
  const payload = JSON.stringify({
    title: "💧 Drink Water!",
    body: "Stay hydrated 🚰"
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload);
  });
};